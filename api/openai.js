const OpenAI = require('openai');

// Initialize OpenAI with server-side environment variable (no REACT_APP_ prefix)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side only, not exposed to client
});

// Check if OpenAI is properly configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is not set');
}

// JSON Schemas for structured outputs
const schemas = {
  itinerarySuggestions: {
    type: "json_schema",
    json_schema: {
      name: "itinerary_suggestions",
      strict: true,
      schema: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "Brief overview of the recommended itinerary"
          },
          parkOrder: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "integer" },
                park: { type: "string" },
                reasoning: { type: "string" }
              },
              required: ["day", "park", "reasoning"],
              additionalProperties: false
            }
          },
          mustDoAttractions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                park: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                reason: { type: "string" }
              },
              required: ["name", "park", "priority", "reason"],
              additionalProperties: false
            }
          },
          diningRecommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                mealType: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
                location: { type: "string" },
                reason: { type: "string" }
              },
              required: ["name", "mealType", "location", "reason"],
              additionalProperties: false
            }
          },
          tips: {
            type: "array",
            items: { type: "string" }
          },
          specialConsiderations: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["summary", "parkOrder", "mustDoAttractions", "diningRecommendations", "tips", "specialConsiderations"],
        additionalProperties: false
      }
    }
  },

  dayOptimization: {
    type: "json_schema",
    json_schema: {
      name: "day_optimization",
      strict: true,
      schema: {
        type: "object",
        properties: {
          suggestedOrder: {
            type: "array",
            items: {
              type: "object",
              properties: {
                activity: { type: "string" },
                suggestedTime: { type: "string" },
                estimatedDuration: { type: "string" },
                priority: { type: "integer", minimum: 1, maximum: 10 }
              },
              required: ["activity", "suggestedTime", "estimatedDuration", "priority"],
              additionalProperties: false
            }
          },
          tips: {
            type: "array",
            items: { type: "string" }
          },
          warnings: {
            type: "array",
            items: { type: "string" }
          },
          alternativeOptions: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["suggestedOrder", "tips", "warnings", "alternativeOptions"],
        additionalProperties: false
      }
    }
  },

  diningRecommendations: {
    type: "json_schema",
    json_schema: {
      name: "dining_recommendations",
      strict: true,
      schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                location: { type: "string" },
                mealType: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack", "any"] },
                cuisine: { type: "string" },
                priceRange: { type: "string", enum: ["$", "$$", "$$$", "$$$$"] },
                estimatedCost: { type: "integer", minimum: 5, maximum: 200 },
                reason: { type: "string" },
                reservationTips: { type: "string" },
                dietaryAccommodations: {
                  type: "array",
                  items: { type: "string" }
                },
                specialFeatures: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["name", "location", "mealType", "cuisine", "priceRange", "estimatedCost", "reason", "reservationTips", "dietaryAccommodations", "specialFeatures"],
              additionalProperties: false
            }
          },
          generalTips: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["recommendations", "generalTips"],
        additionalProperties: false
      }
    }
  },

  rideRecommendations: {
    type: "json_schema",
    json_schema: {
      name: "ride_recommendations",
      strict: true,
      schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                park: { type: "string" },
                land: { type: "string" },
                thrillLevel: { type: "string", enum: ["mild", "moderate", "intense"] },
                heightRequirement: { type: "string" },
                reason: { type: "string" },
                bestTime: { type: "string" },
                lightningLaneRecommended: { type: "boolean" },
                waitTimeStrategy: { type: "string" },
                ageAppropriate: {
                  type: "array",
                  items: { type: "string" }
                },
                accessibilityNotes: { type: "string" }
              },
              required: ["name", "park", "land", "thrillLevel", "heightRequirement", "reason", "bestTime", "lightningLaneRecommended", "waitTimeStrategy", "ageAppropriate", "accessibilityNotes"],
              additionalProperties: false
            }
          },
          generalStrategy: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["recommendations", "generalStrategy"],
        additionalProperties: false
      }
    }
  },

  tripSummary: {
    type: "json_schema",
    json_schema: {
      name: "trip_summary",
      strict: true,
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          overview: { type: "string" },
          highlights: {
            type: "array",
            items: { type: "string" }
          },
          preparationTips: {
            type: "array",
            items: { type: "string" }
          },
          budgetEstimate: {
            type: "object",
            properties: {
              lowEnd: { type: "integer" },
              highEnd: { type: "integer" },
              notes: { type: "string" }
            },
            required: ["lowEnd", "highEnd", "notes"],
            additionalProperties: false
          },
          encouragingMessage: { type: "string" }
        },
        required: ["title", "overview", "highlights", "preparationTips", "budgetEstimate", "encouragingMessage"],
        additionalProperties: false
      }
    }
  }
};

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
    const { trip, preferences, prompt: customPrompt } = data;
    
    // Use custom prompt if provided, otherwise fall back to default
    let systemMessage = 'You are a Disney World vacation planning expert with extensive knowledge of all parks, attractions, dining, and logistics. You must respond with structured data following the exact JSON schema provided. Provide helpful, practical advice in the specified format.';
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

Provide recommendations for park order, must-do attractions, dining, tips, and special considerations. Focus on real Disney World experiences and practical advice.`;

    // Use custom prompt if provided
    if (customPrompt && customPrompt.systemMessage) {
      systemMessage = customPrompt.systemMessage + ' You must respond with structured data following the exact JSON schema provided.';
    }
    if (customPrompt && customPrompt.userPromptTemplate) {
      userPromptTemplate = customPrompt.userPromptTemplate
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
    }

    const maxTokens = customPrompt?.maxTokens || 1500;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userPromptTemplate
        }
      ],
      max_tokens: maxTokens,
      response_format: schemas.itinerarySuggestions
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return res.json({ result });
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
    
    let systemMessage = 'You are a Disney World logistics expert. Provide practical scheduling advice to minimize wait times and maximize enjoyment. You must respond with structured data following the exact JSON schema provided.';
    
    const activities = [
      ...day.rides.map(r => `Ride: ${r.name}`),
      ...day.food.map(f => `Dining: ${f.name} at ${f.timeSlot || 'flexible time'}`),
      ...day.reservations.map(r => `Reservation: ${r.name} at ${r.time}`)
    ];

    let userPromptTemplate = `Optimize this Disney park day plan:

Park: ${day.park?.name || 'Not specified'}
Current Activities: ${activities.join(', ')}

Optimization Preferences:
- Priority: ${preferences.priority}
- Crowd tolerance: ${preferences.crowdTolerance}
- Walking preference: ${preferences.walkingDistance}

Provide a suggested order with times, tips, warnings, and alternative options.`;

    // Use custom prompt if provided
    if (customPrompt && customPrompt.systemMessage) {
      systemMessage = customPrompt.systemMessage + ' You must respond with structured data following the exact JSON schema provided.';
    }
    if (customPrompt && customPrompt.userPromptTemplate) {
      userPromptTemplate = customPrompt.userPromptTemplate
        .replace(/\{\{day\.park\?\.name \|\| 'Not specified'\}\}/g, day.park?.name || 'Not specified')
        .replace(/\{\{activities\.join\(', '\)\}\}/g, activities.join(', '))
        .replace(/\{\{preferences\.priority\}\}/g, preferences.priority)
        .replace(/\{\{preferences\.crowdTolerance\}\}/g, preferences.crowdTolerance)
        .replace(/\{\{preferences\.walkingDistance\}\}/g, preferences.walkingDistance);
    }

    const maxTokens = customPrompt?.maxTokens || 1200;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userPromptTemplate
        }
      ],
      max_tokens: maxTokens,
      response_format: schemas.dayOptimization
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return res.json({ result });
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
    let systemMessage = 'You are a Disney World dining expert with knowledge of all restaurants, menus, and reservation strategies. You must respond with structured data following the exact JSON schema provided.';
    let userPromptTemplate = `Suggest Disney World dining options for:
      
Preferences:
- Park: ${preferences.park || 'Any park'}
- Meal type: ${preferences.mealType}
- Budget: ${preferences.budget}
- Dietary restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
- Group size: ${preferences.groupSize}
- Special occasions: ${preferences.specialOccasion || 'None'}

Recommend 3-5 restaurants with detailed information including cuisine type, pricing, special features, and reservation tips.`;

    // Use custom prompt if provided
    if (customPrompt && customPrompt.systemMessage) {
      systemMessage = customPrompt.systemMessage + ' You must respond with structured data following the exact JSON schema provided.';
    }
    if (customPrompt && customPrompt.userPromptTemplate) {
      userPromptTemplate = customPrompt.userPromptTemplate
        .replace(/\{\{preferences\.park \|\| 'Any park'\}\}/g, preferences?.park || 'Any park')
        .replace(/\{\{preferences\.mealType\}\}/g, preferences?.mealType || 'lunch')
        .replace(/\{\{preferences\.budget\}\}/g, preferences?.budget || 'medium')
        .replace(/\{\{preferences\.dietaryRestrictions\?\.join\(', '\) \|\| 'None'\}\}/g, preferences?.dietaryRestrictions?.join(', ') || 'None')
        .replace(/\{\{preferences\.groupSize\}\}/g, preferences?.groupSize || '2')
        .replace(/\{\{preferences\.specialOccasion \|\| 'None'\}\}/g, preferences?.specialOccasion || 'None');
    }

    const maxTokens = customPrompt?.maxTokens || 1000;

    console.log('=== DINING SUGGESTIONS PROMPT DEBUG ===');
    console.log('System Message:', systemMessage);
    console.log('User Prompt:', userPromptTemplate);
    console.log('Max Tokens:', maxTokens);
    console.log('Custom Prompt Received:', customPrompt ? 'YES' : 'NO');
    console.log('========================================');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userPromptTemplate
        }
      ],
      max_tokens: maxTokens,
      response_format: schemas.diningRecommendations
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    console.log('OpenAI Structured Response:', JSON.stringify(result, null, 2));
    
    return res.json({
      result: result.recommendations || [],
      generalTips: result.generalTips || []
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
    const { preferences, prompt: customPrompt } = data;
    
    // Use custom prompt if provided, otherwise fall back to default
    let systemMessage = 'You are a Disney World attractions expert with knowledge of wait times, Lightning Lane strategies, and guest experiences. You must respond with structured data following the exact JSON schema provided.';
    let userPromptTemplate = `Suggest Disney World attractions for:
      
Preferences:
- Park: ${preferences.park || 'Any park'}
- Thrill level: ${preferences.thrillLevel}
- Ages in group: ${preferences.ages?.join(', ') || 'Not specified'}
- Interests: ${preferences.interests?.join(', ') || 'General'}
- Time available: ${preferences.timeAvailable || 'Full day'}

Recommend 5-8 attractions with detailed information including location, wait time strategies, Lightning Lane recommendations, and accessibility notes.`;

    // Use custom prompt if provided
    if (customPrompt && customPrompt.systemMessage) {
      systemMessage = customPrompt.systemMessage + ' You must respond with structured data following the exact JSON schema provided.';
    }
    if (customPrompt && customPrompt.userPromptTemplate) {
      userPromptTemplate = customPrompt.userPromptTemplate
        .replace(/\{\{preferences\.park \|\| 'Any park'\}\}/g, preferences.park || 'Any park')
        .replace(/\{\{preferences\.thrillLevel\}\}/g, preferences.thrillLevel)
        .replace(/\{\{preferences\.ages\?\.join\(', '\) \|\| 'Not specified'\}\}/g, preferences.ages?.join(', ') || 'Not specified')
        .replace(/\{\{preferences\.interests\?\.join\(', '\) \|\| 'General'\}\}/g, preferences.interests?.join(', ') || 'General')
        .replace(/\{\{preferences\.timeAvailable \|\| 'Full day'\}\}/g, preferences.timeAvailable || 'Full day');
    }

    const maxTokens = customPrompt?.maxTokens || 1000;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userPromptTemplate
        }
      ],
      max_tokens: maxTokens,
      response_format: schemas.rideRecommendations
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return res.json({
      result: result.recommendations || [],
      generalStrategy: result.generalStrategy || []
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
    const { trip, prompt: customPrompt } = data;
    
    // Use custom prompt if provided, otherwise fall back to default
    let systemMessage = 'You are an enthusiastic Disney vacation planner who creates encouraging and helpful trip summaries. You must respond with structured data following the exact JSON schema provided.';
    
    const totalActivities = trip.days.reduce((total, day) => 
      total + day.rides.length + day.food.length + day.reservations.length, 0
    );

    let userPromptTemplate = `Create a friendly trip summary for this Disney vacation:

Trip: ${trip.name}
Duration: ${trip.days.length} days
Resort: ${trip.resort?.name || 'Not specified'}
Total planned activities: ${totalActivities}

Create an encouraging summary with highlights, preparation tips, budget estimates, and an encouraging message.`;

    // Use custom prompt if provided
    if (customPrompt && customPrompt.systemMessage) {
      systemMessage = customPrompt.systemMessage + ' You must respond with structured data following the exact JSON schema provided.';
    }
    if (customPrompt && customPrompt.userPromptTemplate) {
      userPromptTemplate = customPrompt.userPromptTemplate
        .replace(/\{\{trip\.name\}\}/g, trip.name)
        .replace(/\{\{trip\.days\.length\}\}/g, trip.days.length)
        .replace(/\{\{trip\.resort\?\.name \|\| 'Not specified'\}\}/g, trip.resort?.name || 'Not specified')
        .replace(/\{\{totalActivities\}\}/g, totalActivities);
    }

    const maxTokens = customPrompt?.maxTokens || 800;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userPromptTemplate
        }
      ],
      max_tokens: maxTokens,
      response_format: schemas.tripSummary
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return res.json({ result });
  } catch (error) {
    console.error('Error in handleTripSummary:', error);
    return res.status(500).json({ 
      error: 'Failed to generate trip summary: ' + error.message 
    });
  }
} 