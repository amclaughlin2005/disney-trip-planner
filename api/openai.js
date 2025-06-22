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
          overview: { type: "string" },
          highlights: {
            type: "array",
            items: { type: "string" }
          },
          budgetEstimate: {
            type: "object",
            properties: {
              estimatedCost: { type: "integer", minimum: 100, maximum: 50000 },
              costBreakdown: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["estimatedCost", "costBreakdown"],
            additionalProperties: false
          },
          preparationTips: {
            type: "array",
            items: { type: "string" }
          },
          encouragement: { type: "string" }
        },
        required: ["overview", "highlights", "budgetEstimate", "preparationTips", "encouragement"],
        additionalProperties: false
      }
    }
  },

  tripImport: {
    type: "json_schema",
    json_schema: {
      name: "trip_import",
      strict: true,
      schema: {
        type: "object",
        properties: {
          tripName: { type: "string" },
          startDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          endDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          resortName: { type: "string" },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                parkName: { type: "string" },
                transportation: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["bus", "monorail", "boat", "walking", "uber", "lyft", "rental", "other"] },
                      from: { type: "string" },
                      to: { type: "string" },
                      departureTime: { type: "string" },
                      arrivalTime: { type: "string" },
                      notes: { type: "string" }
                    },
                    required: ["type", "from", "to", "departureTime", "arrivalTime", "notes"],
                    additionalProperties: false
                  }
                },
                rides: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      park: { type: "string" },
                      type: { type: "string", enum: ["attraction", "show", "character-meet", "parade", "fireworks"] },
                      priority: { type: "string", enum: ["must-do", "want-to-do", "if-time", "skip"] },
                      timeSlot: { type: "string" },
                      duration: { type: "integer", minimum: 5, maximum: 240 },
                      fastPass: { type: "boolean" },
                      geniePlus: { type: "boolean" },
                      notes: { type: "string" }
                    },
                    required: ["name", "park", "type", "priority", "timeSlot", "duration", "fastPass", "geniePlus", "notes"],
                    additionalProperties: false
                  }
                },
                reservations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string", enum: ["dining", "hotel", "spa", "tour", "other"] },
                      location: { type: "string" },
                      date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                      time: { type: "string" },
                      partySize: { type: "integer", minimum: 1, maximum: 20 },
                      confirmationNumber: { type: "string" },
                      notes: { type: "string" }
                    },
                    required: ["name", "type", "location", "date", "time", "partySize", "confirmationNumber", "notes"],
                    additionalProperties: false
                  }
                },
                food: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string", enum: ["quick-service", "table-service", "character-dining", "snack", "drink", "dessert"] },
                      location: { type: "string" },
                      mealType: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
                      timeSlot: { type: "string" },
                      partySize: { type: "integer", minimum: 1, maximum: 20 },
                      budget: { type: "integer", minimum: 5, maximum: 500 },
                      reservationNumber: { type: "string" },
                      notes: { type: "string" }
                    },
                    required: ["name", "type", "location", "mealType", "timeSlot", "partySize", "budget", "reservationNumber", "notes"],
                    additionalProperties: false
                  }
                }
              },
              required: ["date", "parkName", "transportation", "rides", "reservations", "food"],
              additionalProperties: false
            }
          }
        },
        required: ["tripName", "startDate", "endDate", "resortName", "days"],
        additionalProperties: false
      }
    }
  }
};

module.exports = async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const data = req.body;
    console.log('🤖 OpenAI API request:', { type: data.type, hasData: !!data });

    switch (data.type) {
      case 'itinerary':
        return handleItinerarySuggestions(req, res, data);
      case 'optimization':
        return handleDayOptimization(req, res, data);
      case 'dining':
        return handleDiningSuggestions(req, res, data);
      case 'rides':
        return handleRideSuggestions(req, res, data);
      case 'summary':
        return handleTripSummary(req, res, data);
      case 'import':
        return handleTripImport(req, res, data);
      default:
        res.status(400).json({ error: 'Invalid request type' });
    }
  } catch (error) {
    console.error('🚨 OpenAI API Error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message,
      fallback: 'AI services are temporarily unavailable. Please try again later.'
    });
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

async function handleTripImport(req, res, data) {
  console.log('🎢 Processing trip import request...');
  
  if (!data.fileContent) {
    return res.status(400).json({ error: 'File content is required' });
  }

  // Preprocess the file content to handle encoding issues
  let processedContent = data.fileContent;
  
  // Normalize line endings (convert \r\n and \r to \n)
  processedContent = processedContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Remove or replace problematic Unicode characters
  processedContent = processedContent.replace(/[^\x00-\x7F]/g, (char) => {
    // Replace common problematic characters with safe alternatives
    const replacements = {
      '\uFFFD': '\'', // Replace replacement character with apostrophe
      '\u2018': '\'', // Replace left single quotation mark
      '\u2019': '\'', // Replace right single quotation mark
      '\u201C': '"', // Replace left double quotation mark
      '\u201D': '"', // Replace right double quotation mark
      '\u2013': '-', // Replace en dash
      '\u2014': '-', // Replace em dash
    };
    return replacements[char] || ''; // Remove if no replacement found
  });
  
  // Trim excessive whitespace
  processedContent = processedContent.replace(/\n\s*\n\s*\n/g, '\n\n'); // Replace multiple blank lines with double newline
  processedContent = processedContent.trim();
  
  // Log the actual file content being sent to AI for debugging
  console.log('📄 Original file content preview:', {
    length: data.fileContent.length,
    preview: data.fileContent.substring(0, 300) + '...',
    hasCarriageReturns: data.fileContent.includes('\r'),
    hasSpecialChars: /[^\x00-\x7F]/.test(data.fileContent)
  });
  
  console.log('📄 Processed file content preview:', {
    length: processedContent.length,
    preview: processedContent.substring(0, 300) + '...',
    containsBinaryData: ['\x00', '\x01', '\x02', '\x03', '\x04', '\x05'].some(indicator => 
      processedContent.includes(indicator)
    )
  });

  try {
    // Retrieve custom prompt or use default
    const customPrompt = await getCustomPrompt('import');
    console.log('📝 Using custom prompt for import:', !!customPrompt);

    const systemMessage = customPrompt?.systemMessage || `You are a Disney World trip planning expert that converts user itineraries into structured trip data.

Your task is to analyze the provided itinerary text and convert it into a structured JSON format matching our Disney Trip Planner schema.

IMPORTANT GUIDELINES:
- Extract trip name, dates, resort information, and daily activities
- Identify Disney parks from text (Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom, Disney Springs, etc.)
- Parse transportation between locations
- Identify rides, shows, attractions with appropriate categories
- Extract dining reservations and food plans
- Determine appropriate priority levels (must-do, want-to-do, if-time)
- Set reasonable duration estimates for activities
- Preserve any confirmation numbers, times, and special notes
- If information is unclear or missing, make reasonable Disney-appropriate assumptions
- Use YYYY-MM-DD format for all dates
- Ensure all required fields are populated with sensible defaults when needed

Return a complete structured trip object that can be directly imported into our system.`;

    const userPrompt = customPrompt?.userPromptTemplate || `Please convert this itinerary into our structured Disney trip format:

{{fileContent}}

Instructions:
- Parse all dates, locations, and activities
- Match activities to appropriate Disney categories
- Set realistic time estimates and priorities
- Include all transportation and dining information
- Fill in any missing required fields with reasonable defaults`;

    // Replace template variables with processed content
    const finalUserPrompt = userPrompt.replace('{{fileContent}}', processedContent);

    console.log('🎯 Sending request to OpenAI with structured output...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini instead of o3-mini for better reliability
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: finalUserPrompt }
      ],
      response_format: schemas.tripImport,
      max_tokens: 4000
    });

    console.log('📦 OpenAI Response:', {
      hasChoices: !!completion.choices,
      choicesLength: completion.choices?.length,
      hasContent: !!completion.choices?.[0]?.message?.content,
      contentLength: completion.choices?.[0]?.message?.content?.length,
      contentPreview: completion.choices?.[0]?.message?.content?.substring(0, 200) + '...'
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent || rawContent.trim() === '' || rawContent === '{}' || rawContent === 'null') {
      console.error('❌ Empty or invalid response from OpenAI, triggering fallback...');
      
      // Immediately trigger fallback instead of returning error
      try {
        const fallbackCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `You are a Disney World trip planning expert. Convert the user's itinerary into a valid JSON object that matches this exact structure:

{
  "tripName": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD", 
  "resortName": "string",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "parkName": "string",
      "transportation": [],
      "rides": [
        {
          "name": "string",
          "park": "string", 
          "type": "attraction",
          "priority": "must-do",
          "timeSlot": "time",
          "duration": 30,
          "fastPass": false,
          "geniePlus": false,
          "notes": "string"
        }
      ],
      "reservations": [],
      "food": []
    }
  ]
}

Respond ONLY with valid JSON. No explanations or additional text.` 
            },
            { role: "user", content: `Convert this itinerary to JSON:\n\n${processedContent}` }
          ],
          max_tokens: 3000,
          temperature: 0.1
        });

        const fallbackContent = fallbackCompletion.choices[0]?.message?.content;
        if (!fallbackContent || fallbackContent.trim() === '') {
          console.error('❌ Fallback also returned empty response');
          return res.status(500).json({ 
            error: 'Failed to process trip import',
            details: 'Both primary and fallback AI processing returned empty responses. This may be due to content filtering or processing limitations.'
          });
        }

        console.log('🔄 Using fallback response');
        const result = JSON.parse(fallbackContent);
        console.log('✅ Fallback JSON parsing successful');
        
        return res.json({
          success: true,
          data: result,
          customPromptUsed: !!customPrompt,
          usedFallback: true,
          usage: fallbackCompletion.usage
        });
        
      } catch (fallbackError) {
        console.error('❌ Fallback processing failed:', fallbackError);
        return res.status(500).json({ 
          error: 'Failed to process trip import',
          details: `Primary processing returned empty response and fallback failed: ${fallbackError.message}`
        });
      }
    }

    let result;
    try {
      result = JSON.parse(rawContent);
      console.log('✅ JSON parsing successful');
        } catch (parseError) {
      console.error('❌ JSON parse error:', parseError.message);
      console.error('Raw content that failed to parse:', rawContent);
      return res.status(500).json({ 
        error: 'Failed to process trip import',
        details: `JSON parsing failed: ${parseError.message}. Raw content: ${rawContent.substring(0, 500)}...`
      });
    }
    
    console.log('✅ Trip import successful');
    res.json({
      success: true,
      data: result,
      customPromptUsed: !!customPrompt,
      usage: completion.usage
    });

  } catch (error) {
    console.error('🚨 Trip import error:', error);
    res.status(500).json({ 
      error: 'Failed to process trip import',
      details: error.message
    });
  }
}

// Custom prompt retrieval function
async function getCustomPrompt(category) {
  try {
    // For now, return null to use default prompts
    // This can be enhanced later to integrate with the prompt management system
    return null;
  } catch (error) {
    console.warn(`Failed to retrieve custom prompt for ${category}:`, error);
    return null;
  }
} 