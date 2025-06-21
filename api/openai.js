const OpenAI = require('openai');

// Initialize OpenAI with server-side environment variable (no REACT_APP_ prefix)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side only, not exposed to client
});

// Check if OpenAI is properly configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is not set');
}

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
    });
  }

  try {
    const { action, data } = req.body;

    switch (action) {
      case 'generateItinerarySuggestions':
        return await handleItinerarySuggestions(req, res, data);
      case 'optimizeDayPlan':
        return await handleDayOptimization(req, res, data);
      case 'suggestDining':
        return await handleDiningSuggestions(req, res, data);
      case 'suggestRides':
        return await handleRideSuggestions(req, res, data);
      case 'generateTripSummary':
        return await handleTripSummary(req, res, data);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleItinerarySuggestions(req, res, data) {
  try {
    const { trip, preferences, prompt } = data;
    
    // Use custom prompt if provided, otherwise fall back to default
    let systemMessage = 'You are a Disney World vacation planning expert with extensive knowledge of all parks, attractions, dining, and logistics. Provide helpful, practical advice.';
    let userPromptTemplate = `Create a personalized Disney trip itinerary suggestion for:
      
Trip Details:
- Duration: ${trip.days.length} days
- Resort: ${trip.resort?.name || 'Not specified'}
- Dates: ${trip.startDate} to ${trip.endDate}

Group Preferences:
- Group size: ${preferences.groupSize}
- Ages: ${preferences.ages.join(', ')}
- Interests: ${preferences.interests.join(', ')}
- Budget: ${preferences.budget}
- Mobility level: ${preferences.mobility}
- Thrill preference: ${preferences.thrillLevel}

Please provide:
1. Recommended park order for each day
2. Must-do attractions for this group
3. Dining suggestions
4. General tips and strategies
5. Special considerations for the group's needs

Keep it practical and actionable, focusing on real Disney World experiences.`;

    // Use custom prompt if provided
    if (prompt && prompt.systemMessage) {
      systemMessage = prompt.systemMessage;
    }
    if (prompt && prompt.userPromptTemplate) {
      userPromptTemplate = prompt.userPromptTemplate;
    }

    // Replace template variables in user prompt
    const finalUserPrompt = userPromptTemplate
      .replace(/\{\{trip\.days\.length\}\}/g, trip.days.length)
      .replace(/\{\{trip\.resort\?\.name \|\| 'Not specified'\}\}/g, trip.resort?.name || 'Not specified')
      .replace(/\{\{trip\.startDate\}\}/g, trip.startDate)
      .replace(/\{\{trip\.endDate\}\}/g, trip.endDate)
      .replace(/\{\{preferences\.groupSize\}\}/g, preferences.groupSize)
      .replace(/\{\{preferences\.ages\.join\(', '\)\}\}/g, preferences.ages.join(', '))
      .replace(/\{\{preferences\.interests\.join\(', '\)\}\}/g, preferences.interests.join(', '))
      .replace(/\{\{preferences\.budget\}\}/g, preferences.budget)
      .replace(/\{\{preferences\.mobility\}\}/g, preferences.mobility)
      .replace(/\{\{preferences\.thrillLevel\}\}/g, preferences.thrillLevel);

    const maxTokens = prompt?.maxTokens || 1000;

    const response = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: finalUserPrompt
        }
      ],
      max_completion_tokens: maxTokens
    });

    return res.json({ 
      result: response.choices[0]?.message?.content || 'Unable to generate suggestions at this time.' 
    });
  } catch (error) {
    console.error('Error in handleItinerarySuggestions:', error);
    return res.status(500).json({ 
      error: 'Failed to generate itinerary suggestions: ' + error.message 
    });
  }
}

async function handleDayOptimization(req, res, data) {
  try {
    const { day, preferences, prompt: customPrompt } = data;
    
    const activities = [
      ...day.rides.map(r => `Ride: ${r.name}`),
      ...day.food.map(f => `Dining: ${f.name} at ${f.timeSlot || 'flexible time'}`),
      ...day.reservations.map(r => `Reservation: ${r.name} at ${r.time}`)
    ];

    const promptText = `Optimize this Disney park day plan:

Park: ${day.park?.name || 'Not specified'}
Current Activities: ${activities.join(', ')}

Optimization Preferences:
- Priority: ${preferences.priority}
- Crowd tolerance: ${preferences.crowdTolerance}
- Walking preference: ${preferences.walkingDistance}

Please provide:
1. Suggested order of activities
2. Estimated time for each activity
3. Practical tips for this day
4. Potential issues or warnings

Format as JSON with suggestedOrder, timeEstimates, tips, and warnings arrays.`;

    const response = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Disney World logistics expert. Provide practical scheduling advice to minimize wait times and maximize enjoyment.'
        },
        {
          role: 'user',
          content: promptText
        }
      ],
      max_completion_tokens: 800
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Try to parse JSON response, fallback to basic structure
    try {
      const result = JSON.parse(content);
      return res.json({ result });
    } catch {
      return res.json({
        result: {
          suggestedOrder: activities,
          timeEstimates: {},
          tips: [content],
          warnings: []
        }
      });
    }
  } catch (error) {
    console.error('Error in handleDayOptimization:', error);
    return res.status(500).json({ 
      error: 'Failed to optimize day plan: ' + error.message 
    });
  }
}

async function handleDiningSuggestions(req, res, data) {
  try {
    console.log('Dining suggestions data received:', JSON.stringify(data, null, 2));
    const { preferences, prompt: customPrompt } = data;
    
    // Use custom prompt if provided, otherwise fall back to default
    let systemMessage = 'You are a Disney World dining expert with knowledge of all restaurants, menus, and reservation strategies.';
    let userPromptTemplate = `Suggest Disney World dining options for:
      
Preferences:
- Park: ${preferences.park || 'Any park'}
- Meal type: ${preferences.mealType}
- Budget: ${preferences.budget}
- Dietary restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
- Group size: ${preferences.groupSize}
- Special occasions: ${preferences.specialOccasion || 'None'}

Provide 3-5 specific restaurant recommendations with reasons why they fit the criteria.`;

    // Use custom prompt if provided
    if (customPrompt && customPrompt.systemMessage) {
      systemMessage = customPrompt.systemMessage;
    }
    if (customPrompt && customPrompt.userPromptTemplate) {
      userPromptTemplate = customPrompt.userPromptTemplate;
    }

    // Replace template variables in user prompt with safety checks
    const finalUserPrompt = userPromptTemplate
      .replace(/\{\{preferences\.park \|\| 'Any park'\}\}/g, preferences?.park || 'Any park')
      .replace(/\{\{preferences\.mealType\}\}/g, preferences?.mealType || 'lunch')
      .replace(/\{\{preferences\.budget\}\}/g, preferences?.budget || 'medium')
      .replace(/\{\{preferences\.dietaryRestrictions\?\.join\(', '\) \|\| 'None'\}\}/g, preferences?.dietaryRestrictions?.join(', ') || 'None')
      .replace(/\{\{preferences\.groupSize\}\}/g, preferences?.groupSize || '2')
      .replace(/\{\{preferences\.specialOccasion \|\| 'None'\}\}/g, preferences?.specialOccasion || 'None');

    const maxTokens = customPrompt?.maxTokens || 600;

    console.log('=== DINING SUGGESTIONS PROMPT DEBUG ===');
    console.log('System Message:', systemMessage);
    console.log('User Prompt:', finalUserPrompt);
    console.log('Max Tokens:', maxTokens);
    console.log('Custom Prompt Received:', customPrompt ? 'YES' : 'NO');
    console.log('========================================');

    const response = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: finalUserPrompt
        }
      ],
      max_completion_tokens: maxTokens
    });

    const content = response.choices[0]?.message?.content || '';
    
    console.log('OpenAI Response Content:', content);
    console.log('OpenAI Full Response:', JSON.stringify(response, null, 2));
    
    return res.json({
      result: [
        {
          name: 'AI-Generated Suggestion',
          location: preferences?.park || 'Disney World',
          reason: content,
          estimatedCost: preferences?.budget === 'low' ? 25 : preferences?.budget === 'medium' ? 50 : 100,
          reservationTips: 'Book 60 days in advance for best availability'
        }
      ],
      debug: {
        systemMessage: systemMessage,
        userPrompt: finalUserPrompt,
        maxTokens: maxTokens,
        customPromptReceived: customPrompt ? true : false,
        openAIContent: content,
        preferencesReceived: preferences
      }
    });
  } catch (error) {
    console.error('Error in handleDiningSuggestions:', error);
    return res.status(500).json({ 
      error: 'Failed to generate dining suggestions: ' + error.message 
    });
  }
}

async function handleRideSuggestions(req, res, data) {
  try {
    const { preferences } = data;
    
    const prompt = `Suggest Disney World attractions for:
      
Preferences:
- Park: ${preferences.park || 'Any park'}
- Thrill level: ${preferences.thrillLevel}
- Ages in group: ${preferences.ages?.join(', ') || 'Not specified'}
- Interests: ${preferences.interests?.join(', ') || 'General'}
- Time available: ${preferences.timeAvailable || 'Full day'}

Recommend 5-8 attractions with timing strategies and Lightning Lane recommendations.`;

    const response = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Disney World attractions expert with knowledge of wait times, Lightning Lane strategies, and guest experiences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: 600
    });

    const content = response.choices[0]?.message?.content || '';
    
    return res.json({
      result: [
        {
          name: 'AI-Generated Suggestions',
          park: preferences.park || 'Disney World',
          reason: content,
          bestTime: 'Early morning or evening',
          lightningLaneRecommended: preferences.thrillLevel === 'intense'
        }
      ]
    });
  } catch (error) {
    console.error('Error in handleRideSuggestions:', error);
    return res.status(500).json({ 
      error: 'Failed to generate ride suggestions: ' + error.message 
    });
  }
}

async function handleTripSummary(req, res, data) {
  try {
    const { trip } = data;
    
    const totalActivities = trip.days.reduce((total, day) => 
      total + day.rides.length + day.food.length + day.reservations.length, 0
    );

    const prompt = `Create a friendly trip summary for this Disney vacation:

Trip: ${trip.name}
Duration: ${trip.days.length} days
Resort: ${trip.resort?.name || 'Not specified'}
Total planned activities: ${totalActivities}

Create an encouraging summary highlighting what makes this trip special and any tips for success.`;

    const response = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an enthusiastic Disney vacation planner who creates encouraging and helpful trip summaries.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: 300
    });

    return res.json({ 
      result: response.choices[0]?.message?.content || 'Your Disney trip is going to be magical!' 
    });
  } catch (error) {
    console.error('Error in handleTripSummary:', error);
    return res.status(500).json({ 
      error: 'Failed to generate trip summary: ' + error.message 
    });
  }
} 