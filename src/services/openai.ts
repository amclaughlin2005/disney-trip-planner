import { Trip, TripDay } from '../types';

// Check if we're in development mode and can make API calls
const isOpenAIConfigured = (): boolean => {
  // Always return true since we'll use our secure API route
  return true;
};

// Helper function to make secure API calls to our backend
const callSecureAPI = async (action: string, data: any) => {
  try {
    // Use different endpoints for development vs production
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/openai'  // Development server
      : '/api/openai';  // Vercel serverless function in production
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('API Error Response:', errorData);
      throw new Error(errorData.error || `API call failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Secure API call failed:', error);
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`AI Service Error: ${error.message}`);
    }
    throw new Error('AI Service Error: Unknown error occurred');
  }
};

console.log('🤖 OpenAI service initialized with secure API proxy');

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

// OpenAI implementation using secure API
export const openAIService: AIService = {
  async generateItinerarySuggestions(trip: Trip, preferences: ItineraryPreferences): Promise<string> {
    try {
      const response = await callSecureAPI('generateItinerarySuggestions', { trip, preferences });
      return response.result || 'Unable to generate suggestions at this time.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI suggestions. Please try again.');
    }
  },

  async optimizeDayPlan(day: TripDay, preferences: OptimizationPreferences): Promise<DayOptimization> {
    try {
      const response = await callSecureAPI('optimizeDayPlan', { day, preferences });
      return response.result;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to optimize day plan. Please try again.');
    }
  },

  async suggestDining(preferences: DiningPreferences): Promise<DiningSuggestion[]> {
    try {
      const response = await callSecureAPI('suggestDining', { preferences });
      return response.result;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate dining suggestions. Please try again.');
    }
  },

  async suggestRides(preferences: RidePreferences): Promise<RideSuggestion[]> {
    try {
      const response = await callSecureAPI('suggestRides', { preferences });
      return response.result;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate ride suggestions. Please try again.');
    }
  },

  async generateTripSummary(trip: Trip): Promise<string> {
    try {
      const response = await callSecureAPI('generateTripSummary', { trip });
      return response.result || 'Your Disney trip is going to be magical!';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate trip summary. Please try again.');
    }
  },

  isAvailable(): boolean {
    return true; // Always available since we use secure API route
  }
};

// Fallback service when API is not available
export const fallbackAIService: AIService = {
  async generateItinerarySuggestions(): Promise<string> {
    return 'AI features are temporarily unavailable. Please try again later.';
  },

  async optimizeDayPlan(): Promise<DayOptimization> {
    return {
      suggestedOrder: [],
      timeEstimates: {},
      tips: ['AI optimization is temporarily unavailable'],
      warnings: ['Please try again later']
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

// Always use the secure API service
export const aiService: AIService = openAIService;

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