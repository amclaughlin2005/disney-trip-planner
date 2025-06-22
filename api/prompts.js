const { put, del, list, head } = require('@vercel/blob');

// Default prompts that will be initialized if none exist
const defaultPrompts = [
  {
    id: 'itinerary',
    name: 'Trip Itinerary Suggestions',
    description: 'Generates personalized Disney World trip itineraries based on preferences',
    systemMessage: 'You are a Disney World vacation planning expert with extensive knowledge of all parks, attractions, dining, and logistics. Provide helpful, practical advice.',
    userPromptTemplate: `Create a personalized Disney trip itinerary suggestion for:
      
Trip Details:
- Duration: {{trip.days.length}} days
- Resort: {{trip.resort?.name || 'Not specified'}}
- Dates: {{trip.startDate}} to {{trip.endDate}}

Group Preferences:
- Group size: {{preferences.groupSize}}
- Ages: {{preferences.ages.join(', ')}}
- Interests: {{preferences.interests.join(', ')}}
- Budget: {{preferences.budget}}
- Mobility level: {{preferences.mobility}}
- Thrill preference: {{preferences.thrillLevel}}

Please provide:
1. Recommended park order for each day
2. Must-do attractions for this group
3. Dining suggestions
4. General tips and strategies
5. Special considerations for the group's needs

Keep it practical and actionable, focusing on real Disney World experiences.`,
    category: 'itinerary',
    maxTokens: 1000,
    lastModified: new Date().toISOString()
  },
  {
    id: 'optimization',
    name: 'Day Plan Optimization',
    description: 'Optimizes the order and timing of activities for a Disney park day',
    systemMessage: 'You are a Disney World logistics expert. Provide practical scheduling advice to minimize wait times and maximize enjoyment.',
    userPromptTemplate: `Optimize this Disney park day plan:

Park: {{day.park?.name || 'Not specified'}}
Current Activities: {{activities.join(', ')}}

Optimization Preferences:
- Priority: {{preferences.priority}}
- Crowd tolerance: {{preferences.crowdTolerance}}
- Walking preference: {{preferences.walkingDistance}}

Please provide:
1. Suggested order of activities
2. Estimated time for each activity
3. Practical tips for this day
4. Potential issues or warnings

Format as JSON with suggestedOrder, timeEstimates, tips, and warnings arrays.`,
    category: 'optimization',
    maxTokens: 800,
    lastModified: new Date().toISOString()
  },
  {
    id: 'dining',
    name: 'Dining Recommendations',
    description: 'Suggests Disney World restaurants based on preferences and dietary needs',
    systemMessage: 'You are a Disney World dining expert with knowledge of all restaurants, menus, and reservation strategies.',
    userPromptTemplate: `Suggest Disney World dining options for:
      
Preferences:
- Park: {{preferences.park || 'Any park'}}
- Meal type: {{preferences.mealType}}
- Budget: {{preferences.budget}}
- Dietary restrictions: {{preferences.dietaryRestrictions?.join(', ') || 'None'}}
- Group size: {{preferences.groupSize}}
- Special occasions: {{preferences.specialOccasion || 'None'}}

Provide 3-5 specific restaurant recommendations. Format each recommendation as:

**Restaurant Name**
Location: [Park/Area]
Why it fits: [Explanation of why this matches their preferences]
---`,
    category: 'dining',
    maxTokens: 600,
    lastModified: new Date().toISOString()
  },
  {
    id: 'rides',
    name: 'Attraction Recommendations',
    description: 'Recommends Disney World attractions based on thrill level and interests',
    systemMessage: 'You are a Disney World attractions expert with knowledge of wait times, Lightning Lane strategies, and guest experiences.',
    userPromptTemplate: `Suggest Disney World attractions for:
      
Preferences:
- Park: {{preferences.park || 'Any park'}}
- Thrill level: {{preferences.thrillLevel}}
- Ages in group: {{preferences.ages?.join(', ') || 'Not specified'}}
- Interests: {{preferences.interests?.join(', ') || 'General'}}
- Time available: {{preferences.timeAvailable || 'Full day'}}

Recommend 5-8 attractions with timing strategies and Lightning Lane recommendations.`,
    category: 'rides',
    maxTokens: 600,
    lastModified: new Date().toISOString()
  },
  {
    id: 'summary',
    name: 'Trip Summary Generator',
    description: 'Creates encouraging summaries of planned Disney trips with helpful tips',
    systemMessage: 'You are an enthusiastic Disney vacation planner who creates encouraging and helpful trip summaries.',
    userPromptTemplate: `Create a friendly trip summary for this Disney vacation:

Trip: {{trip.name}}
Duration: {{trip.days.length}} days
Resort: {{trip.resort?.name || 'Not specified'}}
Total planned activities: {{totalActivities}}

Create an encouraging summary highlighting what makes this trip special and any tips for success.`,
    category: 'summary',
    maxTokens: 300,
    lastModified: new Date().toISOString()
  }
];

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.body || {};

    switch (action) {
      case 'getPrompts':
        return await handleGetPrompts(req, res);
      case 'savePrompts':
        return await handleSavePrompts(req, res);
      case 'getPrompt':
        return await handleGetPrompt(req, res);
      case 'savePrompt':
        return await handleSavePrompt(req, res);
      case 'resetPrompts':
        return await handleResetPrompts(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in prompts API:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};

async function handleGetPrompts(req, res) {
  try {
    // Try to get prompts from Vercel Blob
    const { blobs } = await list({ prefix: 'ai-prompts/' });
    
    if (blobs.length === 0) {
      // No prompts exist, initialize with defaults
      console.log('No prompts found in blob storage, initializing with defaults');
      await initializeDefaultPrompts();
      return res.json({ prompts: defaultPrompts });
    }

    // Get the latest prompts file
    const promptsBlob = blobs.find(blob => blob.pathname === 'ai-prompts/prompts.json');
    if (!promptsBlob) {
      // Prompts file doesn't exist, initialize with defaults
      await initializeDefaultPrompts();
      return res.json({ prompts: defaultPrompts });
    }

    // Fetch the prompts data
    const response = await fetch(promptsBlob.url);
    const prompts = await response.json();
    
    return res.json({ prompts });
  } catch (error) {
    console.error('Error getting prompts:', error);
    // Fallback to defaults if there's an error
    return res.json({ prompts: defaultPrompts });
  }
}

async function handleSavePrompts(req, res) {
  try {
    const { prompts } = req.body;
    
    if (!prompts || !Array.isArray(prompts)) {
      return res.status(400).json({ error: 'Invalid prompts data' });
    }

    // Save prompts to Vercel Blob
    const blob = await put('ai-prompts/prompts.json', JSON.stringify(prompts, null, 2), {
      access: 'public',
      contentType: 'application/json'
    });

    console.log('Prompts saved to blob storage:', blob.url);
    return res.json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Error saving prompts:', error);
    return res.status(500).json({ error: 'Failed to save prompts: ' + error.message });
  }
}

async function handleGetPrompt(req, res) {
  try {
    const { category } = req.body;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Get all prompts and find the one for this category
    const { blobs } = await list({ prefix: 'ai-prompts/' });
    const promptsBlob = blobs.find(blob => blob.pathname === 'ai-prompts/prompts.json');
    
    if (!promptsBlob) {
      // No prompts exist, return default for this category
      const defaultPrompt = defaultPrompts.find(p => p.category === category);
      return res.json({ prompt: defaultPrompt || null });
    }

    const response = await fetch(promptsBlob.url);
    const prompts = await response.json();
    const prompt = prompts.find(p => p.category === category);
    
    return res.json({ prompt: prompt || null });
  } catch (error) {
    console.error('Error getting prompt:', error);
    // Fallback to default
    const defaultPrompt = defaultPrompts.find(p => p.category === req.body.category);
    return res.json({ prompt: defaultPrompt || null });
  }
}

async function handleSavePrompt(req, res) {
  try {
    const { prompt } = req.body;
    
    if (!prompt || !prompt.id || !prompt.category) {
      return res.status(400).json({ error: 'Invalid prompt data' });
    }

    // Get existing prompts
    const { prompts: existingPrompts } = await handleGetPrompts({ body: {} }, { json: () => {} });
    
    // Update or add the prompt
    const updatedPrompts = existingPrompts.map(p => 
      p.id === prompt.id ? { ...prompt, lastModified: new Date().toISOString() } : p
    );
    
    // If prompt wasn't found, add it
    if (!updatedPrompts.find(p => p.id === prompt.id)) {
      updatedPrompts.push({ ...prompt, lastModified: new Date().toISOString() });
    }

    // Save back to blob storage
    await handleSavePrompts({ body: { prompts: updatedPrompts } }, res);
  } catch (error) {
    console.error('Error saving prompt:', error);
    return res.status(500).json({ error: 'Failed to save prompt: ' + error.message });
  }
}

async function handleResetPrompts(req, res) {
  try {
    // Reset to default prompts
    await initializeDefaultPrompts();
    return res.json({ success: true, prompts: defaultPrompts });
  } catch (error) {
    console.error('Error resetting prompts:', error);
    return res.status(500).json({ error: 'Failed to reset prompts: ' + error.message });
  }
}

async function initializeDefaultPrompts() {
  try {
    const blob = await put('ai-prompts/prompts.json', JSON.stringify(defaultPrompts, null, 2), {
      access: 'public',
      contentType: 'application/json'
    });
    console.log('Default prompts initialized in blob storage:', blob.url);
    return blob;
  } catch (error) {
    console.error('Error initializing default prompts:', error);
    throw error;
  }
} 