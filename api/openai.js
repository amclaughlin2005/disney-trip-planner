import OpenAI from 'openai';

// Initialize OpenAI with server-side environment variable (no REACT_APP_ prefix)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side only, not exposed to client
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
  const { trip, preferences } = data;
  
  const prompt = `Create a personalized Disney trip itinerary suggestion for:
    
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

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a Disney World vacation planning expert with extensive knowledge of all parks, attractions, dining, and logistics. Provide helpful, practical advice.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1000,
    temperature: 0.7
  });

  return res.json({ 
    result: response.choices[0]?.message?.content || 'Unable to generate suggestions at this time.' 
  });
}

async function handleDayOptimization(req, res, data) {
  const { day, preferences } = data;
  
  const activities = [
    ...day.rides.map(r => `Ride: ${r.name}`),
    ...day.food.map(f => `Dining: ${f.name} at ${f.timeSlot || 'flexible time'}`),
    ...day.reservations.map(r => `Reservation: ${r.name} at ${r.time}`)
  ];

  const prompt = `Optimize this Disney park day plan:

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
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a Disney World logistics expert. Provide practical scheduling advice to minimize wait times and maximize enjoyment.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 800,
    temperature: 0.5
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
}

async function handleDiningSuggestions(req, res, data) {
  const { preferences } = data;
  
  const prompt = `Suggest Disney World dining options for:
    
Preferences:
- Park: ${preferences.park || 'Any park'}
- Meal type: ${preferences.mealType}
- Budget: ${preferences.budget}
- Dietary restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
- Group size: ${preferences.groupSize}
- Special occasions: ${preferences.specialOccasion || 'None'}

Provide 3-5 specific restaurant recommendations with reasons why they fit the criteria.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a Disney World dining expert with knowledge of all restaurants, menus, and reservation strategies.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 600,
    temperature: 0.7
  });

  const content = response.choices[0]?.message?.content || '';
  
  return res.json({
    result: [
      {
        name: 'AI-Generated Suggestion',
        location: preferences.park || 'Disney World',
        reason: content,
        estimatedCost: preferences.budget === 'low' ? 25 : preferences.budget === 'medium' ? 50 : 100,
        reservationTips: 'Book 60 days in advance for best availability'
      }
    ]
  });
}

async function handleRideSuggestions(req, res, data) {
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
    model: 'gpt-3.5-turbo',
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
    max_tokens: 600,
    temperature: 0.7
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
}

async function handleTripSummary(req, res, data) {
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
    model: 'gpt-3.5-turbo',
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
    max_tokens: 300,
    temperature: 0.8
  });

  return res.json({ 
    result: response.choices[0]?.message?.content || 'Your Disney trip is going to be magical!' 
  });
} 