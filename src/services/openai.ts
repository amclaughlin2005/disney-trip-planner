import OpenAI from 'openai';
import { Trip, TripDay } from '../types';

// Check if OpenAI is configured
const isOpenAIConfigured = (): boolean => {
  return !!process.env.REACT_APP_OPENAI_API_KEY;
};

// Initialize OpenAI client
let openai: OpenAI | null = null;

if (isOpenAIConfigured()) {
  try {
    openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
    });
    console.log('OpenAI initialized successfully');
  } catch (error) {
    console.error('Failed to initialize OpenAI:', error);
  }
} else {
  console.log('OpenAI not configured - AI features disabled');
}

export interface AIService {
  generateItinerarySuggestions: (trip: Trip, preferences: ItineraryPreferences) => Promise<string>;
  optimizeDayPlan: (day: TripDay, preferences: OptimizationPreferences) => Promise<DayOptimization>;
  suggestDining: (preferences: DiningPreferences) => Promise<DiningSuggestion[]>;
  suggestRides: (preferences: RidePreferences) => Promise<RideSuggestion[]>;
  generateTripSummary: (trip: Trip) => Promise<string>;
  isAvailable: () => boolean;
}

export interface ItineraryPreferences {
  groupSize: number;
  ages: number[];
  interests: string[];
  budget: 'low' | 'medium' | 'high';
  mobility: 'high' | 'medium' | 'low';
  thrillLevel: 'mild' | 'moderate' | 'intense' | 'mixed';
}

export interface OptimizationPreferences {
  priority: 'rides' | 'dining' | 'shows' | 'balanced';
  crowdTolerance: 'low' | 'medium' | 'high';
  walkingDistance: 'minimal' | 'moderate' | 'extensive';
}

export interface DayOptimization {
  suggestedOrder: string[];
  timeEstimates: { [key: string]: string };
  tips: string[];
  warnings: string[];
}

export interface DiningSuggestion {
  name: string;
  location: string;
  reason: string;
  estimatedCost: number;
  reservationTips: string;
}

export interface RideSuggestion {
  name: string;
  park: string;
  reason: string;
  bestTime: string;
  lightningLaneRecommended: boolean;
}

// OpenAI implementation
export const openAIService: AIService = {
  async generateItinerarySuggestions(trip: Trip, preferences: ItineraryPreferences): Promise<string> {
    if (!openai) {
      throw new Error('OpenAI not configured');
    }

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

    try {
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

      return response.choices[0]?.message?.content || 'Unable to generate suggestions at this time.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI suggestions. Please try again.');
    }
  },

  async optimizeDayPlan(day: TripDay, preferences: OptimizationPreferences): Promise<DayOptimization> {
    if (!openai) {
      throw new Error('OpenAI not configured');
    }

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

    try {
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
        return JSON.parse(content);
      } catch {
        return {
          suggestedOrder: activities,
          timeEstimates: {},
          tips: [content],
          warnings: []
        };
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to optimize day plan. Please try again.');
    }
  },

  async suggestDining(preferences: DiningPreferences): Promise<DiningSuggestion[]> {
    if (!openai) {
      throw new Error('OpenAI not configured');
    }

    const prompt = `Suggest Disney World dining options for:
    
Preferences:
- Park: ${preferences.park || 'Any park'}
- Meal type: ${preferences.mealType}
- Budget: ${preferences.budget}
- Dietary restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
- Group size: ${preferences.groupSize}
- Special occasions: ${preferences.specialOccasion || 'None'}

Provide 3-5 specific restaurant recommendations with reasons why they fit the criteria.`;

    try {
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

      // Parse response into structured suggestions
      const content = response.choices[0]?.message?.content || '';
      
      // This is a simplified parser - in production, you'd want more robust parsing
      return [
        {
          name: 'AI-Generated Suggestion',
          location: preferences.park || 'Disney World',
          reason: content,
          estimatedCost: preferences.budget === 'low' ? 25 : preferences.budget === 'medium' ? 50 : 100,
          reservationTips: 'Book 60 days in advance for best availability'
        }
      ];
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate dining suggestions. Please try again.');
    }
  },

  async suggestRides(preferences: RidePreferences): Promise<RideSuggestion[]> {
    if (!openai) {
      throw new Error('OpenAI not configured');
    }

    const prompt = `Suggest Disney World attractions for:
    
Preferences:
- Park: ${preferences.park || 'Any park'}
- Thrill level: ${preferences.thrillLevel}
- Ages in group: ${preferences.ages?.join(', ') || 'Not specified'}
- Interests: ${preferences.interests?.join(', ') || 'General'}
- Time available: ${preferences.timeAvailable || 'Full day'}

Recommend 5-8 attractions with timing strategies and Lightning Lane recommendations.`;

    try {
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
      
      // Simplified parser - return basic structure
      return [
        {
          name: 'AI-Generated Suggestions',
          park: preferences.park || 'Disney World',
          reason: content,
          bestTime: 'Early morning or evening',
          lightningLaneRecommended: preferences.thrillLevel === 'intense'
        }
      ];
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate ride suggestions. Please try again.');
    }
  },

  async generateTripSummary(trip: Trip): Promise<string> {
    if (!openai) {
      throw new Error('OpenAI not configured');
    }

    const totalActivities = trip.days.reduce((total, day) => 
      total + day.rides.length + day.food.length + day.reservations.length, 0
    );

    const prompt = `Create a friendly trip summary for this Disney vacation:

Trip: ${trip.name}
Duration: ${trip.days.length} days
Resort: ${trip.resort?.name || 'Not specified'}
Total planned activities: ${totalActivities}

Create an encouraging summary highlighting what makes this trip special and any tips for success.`;

    try {
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

      return response.choices[0]?.message?.content || 'Your Disney trip is going to be magical!';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate trip summary. Please try again.');
    }
  },

  isAvailable(): boolean {
    return !!openai;
  }
};

// Fallback service when OpenAI is not configured
export const fallbackAIService: AIService = {
  async generateItinerarySuggestions(): Promise<string> {
    return 'AI features are not configured. Please add your OpenAI API key to enable smart suggestions.';
  },

  async optimizeDayPlan(): Promise<DayOptimization> {
    return {
      suggestedOrder: [],
      timeEstimates: {},
      tips: ['AI optimization requires OpenAI API configuration'],
      warnings: ['AI features are currently disabled']
    };
  },

  async suggestDining(): Promise<DiningSuggestion[]> {
    return [];
  },

  async suggestRides(): Promise<RideSuggestion[]> {
    return [];
  },

  async generateTripSummary(): Promise<string> {
    return 'Your Disney trip is going to be magical!';
  },

  isAvailable(): boolean {
    return false;
  }
};

// Export the appropriate service based on configuration
export const aiService: AIService = isOpenAIConfigured() ? openAIService : fallbackAIService;

// Additional interfaces for AI features
export interface DiningPreferences {
  park?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  budget: 'low' | 'medium' | 'high';
  dietaryRestrictions?: string[];
  groupSize: number;
  specialOccasion?: string;
}

export interface RidePreferences {
  park?: string;
  thrillLevel: 'mild' | 'moderate' | 'intense' | 'mixed';
  ages?: number[];
  interests?: string[];
  timeAvailable?: string;
}

export { isOpenAIConfigured }; 