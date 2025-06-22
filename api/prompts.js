const { put, del, list, head } = require('@vercel/blob');

// Add debugging for environment variables
console.log('BLOB_READ_WRITE_TOKEN available:', !!process.env.BLOB_READ_WRITE_TOKEN);
console.log('BLOB_READ_WRITE_TOKEN length:', process.env.BLOB_READ_WRITE_TOKEN?.length || 0);

// Default prompts that will be initialized if none exist
const defaultPrompts = [
  {
    id: 'itinerary',
    name: 'Trip Itinerary Suggestions',
    description: 'Generates personalized Disney World trip itineraries based on preferences using structured output',
    systemMessage: 'You are a Disney World vacation planning expert with extensive knowledge of all parks, attractions, dining, and logistics. You must respond with structured data following the exact JSON schema provided. Provide helpful, practical advice in the specified format.',
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

Provide structured recommendations including:
- Brief summary of the itinerary
- Recommended park order for each day with reasoning
- Must-do attractions categorized by priority
- Dining recommendations with meal types and locations
- General tips and strategies
- Special considerations for the group's needs

Focus on real Disney World experiences and practical advice.`,
    category: 'itinerary',
    maxTokens: 1500,
    lastModified: new Date().toISOString()
  },
  {
    id: 'optimization',
    name: 'Day Plan Optimization',
    description: 'Optimizes the order and timing of activities for a Disney park day using structured output',
    systemMessage: 'You are a Disney World logistics expert. Provide practical scheduling advice to minimize wait times and maximize enjoyment. You must respond with structured data following the exact JSON schema provided.',
    userPromptTemplate: `Optimize this Disney park day plan:

Park: {{day.park?.name || 'Not specified'}}
Current Activities: {{activities.join(', ')}}

Optimization Preferences:
- Priority: {{preferences.priority}}
- Crowd tolerance: {{preferences.crowdTolerance}}
- Walking preference: {{preferences.walkingDistance}}

Provide structured recommendations including:
- Suggested order of activities with specific times and durations
- Priority rankings for each activity
- Practical tips for this day
- Potential issues or warnings
- Alternative options if plans change

Focus on minimizing wait times and maximizing guest satisfaction.`,
    category: 'optimization',
    maxTokens: 1200,
    lastModified: new Date().toISOString()
  },
  {
    id: 'dining',
    name: 'Dining Recommendations',
    description: 'Suggests Disney World restaurants based on preferences and dietary needs using structured output',
    systemMessage: 'You are a Disney World dining expert with knowledge of all restaurants, menus, and reservation strategies. You must respond with structured data following the exact JSON schema provided.',
    userPromptTemplate: `Suggest Disney World dining options for:
      
Preferences:
- Park: {{preferences.park || 'Any park'}}
- Meal type: {{preferences.mealType}}
- Budget: {{preferences.budget}}
- Dietary restrictions: {{preferences.dietaryRestrictions?.join(', ') || 'None'}}
- Group size: {{preferences.groupSize}}
- Special occasions: {{preferences.specialOccasion || 'None'}}

Provide 3-5 restaurant recommendations with structured information including:
- Restaurant name and location
- Cuisine type and meal type
- Price range and estimated cost per person
- Reason it matches their preferences
- Reservation tips and strategies
- Dietary accommodations available
- Special features or highlights
- General dining tips for Disney World

Focus on restaurants that truly match their preferences and budget.`,
    category: 'dining',
    maxTokens: 1000,
    lastModified: new Date().toISOString()
  },
  {
    id: 'rides',
    name: 'Attraction Recommendations',
    description: 'Recommends Disney World attractions based on thrill level and interests using structured output',
    systemMessage: 'You are a Disney World attractions expert with knowledge of wait times, Lightning Lane strategies, and guest experiences. You must respond with structured data following the exact JSON schema provided.',
    userPromptTemplate: `Suggest Disney World attractions for:
      
Preferences:
- Park: {{preferences.park || 'Any park'}}
- Thrill level: {{preferences.thrillLevel}}
- Ages in group: {{preferences.ages?.join(', ') || 'Not specified'}}
- Interests: {{preferences.interests?.join(', ') || 'General'}}
- Time available: {{preferences.timeAvailable || 'Full day'}}

Recommend 5-8 attractions with detailed structured information including:
- Attraction name, park, and specific land/area
- Thrill level and height requirements
- Reason it matches their preferences
- Best times to visit and wait time strategies
- Lightning Lane recommendations
- Age appropriateness and accessibility notes
- General strategy tips for maximizing their park experience

Focus on attractions that match their thrill level and group composition.`,
    category: 'rides',
    maxTokens: 1000,
    lastModified: new Date().toISOString()
  },
  {
    id: 'summary',
    name: 'Trip Summary Generator',
    description: 'Creates encouraging summaries of planned Disney trips with helpful tips using structured output',
    systemMessage: 'You are an enthusiastic Disney vacation planner who creates encouraging and helpful trip summaries. You must respond with structured data following the exact JSON schema provided.',
    userPromptTemplate: `Create a friendly trip summary for this Disney vacation:

Trip: {{trip.name}}
Duration: {{trip.days.length}} days
Resort: {{trip.resort?.name || 'Not specified'}}
Total planned activities: {{totalActivities}}

Create a structured summary including:
- Engaging title for the trip
- Overview of what makes this trip special
- Key highlights and memorable experiences
- Preparation tips for success
- Budget estimate with helpful notes
- Encouraging message to build excitement

Focus on creating enthusiasm while providing practical value.`,
    category: 'summary',
    maxTokens: 800,
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
    console.log('handleGetPrompts called');
    
    // Check if we have the required environment variable
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN environment variable is not set');
      return res.json({ prompts: defaultPrompts });
    }

    // Try to get prompts from Vercel Blob
    console.log('Listing blobs with prefix ai-prompts/');
    const { blobs } = await list({ prefix: 'ai-prompts/' });
    console.log('Found', blobs.length, 'blobs:', blobs.map(b => b.pathname));
    
    if (blobs.length === 0) {
      // No prompts exist, initialize with defaults
      console.log('No prompts found in blob storage, initializing with defaults');
      await initializeDefaultPrompts();
      return res.json({ prompts: defaultPrompts });
    }

    // Look for the standard prompts file
    const promptsBlob = blobs.find(blob => blob.pathname === 'ai-prompts/prompts.json');
    console.log('Looking for ai-prompts/prompts.json, found:', promptsBlob ? 'YES' : 'NO');
    
    if (!promptsBlob) {
      // No prompts file found, initialize with defaults
      console.log('No prompts file found, initializing with defaults');
      await initializeDefaultPrompts();
      return res.json({ prompts: defaultPrompts });
    }

    // Fetch the prompts data
    console.log('Fetching prompts from:', promptsBlob.url);
    const response = await fetch(promptsBlob.url);
    
    if (!response.ok) {
      console.log('Failed to fetch prompts, status:', response.status);
      throw new Error(`Failed to fetch prompts: ${response.statusText}`);
    }
    
    const responseText = await response.text();
    if (!responseText || responseText.startsWith('Blob not found')) {
      console.log('Blob not found or empty, initializing with defaults');
      await initializeDefaultPrompts();
      return res.json({ prompts: defaultPrompts });
    }
    
    const prompts = JSON.parse(responseText);
    console.log('Retrieved', prompts.length, 'prompts from blob storage');
    
    return res.json({ prompts });
  } catch (error) {
    console.error('Error getting prompts:', error);
    // Fallback to defaults if there's an error
    return res.json({ prompts: defaultPrompts });
  }
}

async function handleSavePrompts(req, res) {
  try {
    console.log('handleSavePrompts called with:', req.body);
    const { prompts } = req.body;
    
    if (!prompts || !Array.isArray(prompts)) {
      console.error('Invalid prompts data:', prompts);
      return res.status(400).json({ error: 'Invalid prompts data' });
    }

    console.log('Attempting to save', prompts.length, 'prompts to Vercel Blob');

    // Check if we have the required environment variable
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN environment variable is not set');
      return res.status(500).json({ error: 'Blob storage not configured' });
    }

    // Save prompts to Vercel Blob with overwrite allowed
    const filename = `ai-prompts/prompts.json`;
    
    const blob = await put(filename, JSON.stringify(prompts, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    });

    console.log('Prompts saved successfully to blob storage:', blob.url);
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
    console.log('Initializing default prompts...');
    
    // Check if we have the required environment variable
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN environment variable is not set');
      throw new Error('Blob storage not configured');
    }

    // Clean up any existing prompts files first
    try {
      const { blobs } = await list({ prefix: 'ai-prompts/' });
      for (const blob of blobs) {
        try {
          await del(blob.pathname);
          console.log('Deleted existing prompts file:', blob.pathname);
        } catch (deleteError) {
          console.log('Could not delete file:', blob.pathname, deleteError.message);
        }
      }
    } catch (listError) {
      console.log('Could not list existing files:', listError.message);
    }

    // Create initial prompts file
    const filename = `ai-prompts/prompts.json`;
    
    const blob = await put(filename, JSON.stringify(defaultPrompts, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    });
    console.log('Default prompts initialized successfully in blob storage:', blob.url);
    return blob;
  } catch (error) {
    console.error('Error initializing default prompts:', error);
    throw error;
  }
} 