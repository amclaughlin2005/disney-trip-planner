import { Trip, TripDay } from '../types';

// AI Prompt interface matching the admin panel
interface AIPrompt {
  id: string;
  name: string;
  description: string;
  systemMessage: string;
  userPromptTemplate: string;
  category: 'itinerary' | 'optimization' | 'dining' | 'rides' | 'summary';
  maxTokens: number;
  lastModified: string;
}

// Check if we're in development mode and can make API calls
const isOpenAIConfigured = (): boolean => {
  // Always return true since we'll use our secure API route
  return true;
};

// Get current prompts from localStorage (from admin panel)
// Get prompts from Vercel Blob storage via API
const getCurrentPrompts = async (): Promise<AIPrompt[]> => {
  try {
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/prompts'
      : '/api/prompts';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'getPrompts' }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prompts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.prompts || [];
  } catch (error) {
    console.error('Error loading prompts from blob storage:', error);
    return [];
  }
};

// Get specific prompt by category from blob storage
const getPromptByCategory = async (category: AIPrompt['category']): Promise<AIPrompt | null> => {
  try {
    console.log('getPromptByCategory called for category:', category);
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/prompts'
      : '/api/prompts';
    
    console.log('Making request to:', apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'getPrompt', category }),
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch prompt: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Retrieved prompt data:', data);
    console.log('Retrieved prompt for category:', category, data.prompt ? 'FOUND' : 'NOT FOUND');
    if (data.prompt) {
      console.log('Prompt name:', data.prompt.name);
      console.log('Prompt system message preview:', data.prompt.systemMessage?.substring(0, 50) + '...');
    }
    return data.prompt || null;
  } catch (error) {
    console.error('Error loading prompt from blob storage:', error);
    return null;
  }
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
  suggestedOrder: Array<{
    activity: string;
    suggestedTime: string;
    estimatedDuration: string;
    priority: number;
  }>;
  tips: string[];
  warnings: string[];
  alternativeOptions: string[];
}

export interface DiningSuggestion {
  name: string;
  location: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'any';
  cuisine: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  estimatedCost: number;
  reason: string;
  reservationTips: string;
  dietaryAccommodations: string[];
  specialFeatures: string[];
}

export interface RideSuggestion {
  name: string;
  park: string;
  land: string;
  thrillLevel: 'mild' | 'moderate' | 'intense';
  heightRequirement: string;
  reason: string;
  bestTime: string;
  lightningLaneRecommended: boolean;
  waitTimeStrategy: string;
  ageAppropriate: string[];
  accessibilityNotes: string;
}

// OpenAI implementation using secure API
export const openAIService: AIService = {
  async generateItinerarySuggestions(trip: Trip, preferences: ItineraryPreferences): Promise<string> {
    try {
      const prompt = await getPromptByCategory('itinerary');
      const response = await callSecureAPI('generateItinerarySuggestions', { trip, preferences, prompt });
      return response.result || 'Unable to generate suggestions at this time.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI suggestions. Please try again.');
    }
  },

  async optimizeDayPlan(day: TripDay, preferences: OptimizationPreferences): Promise<DayOptimization> {
    try {
      const prompt = await getPromptByCategory('optimization');
      const response = await callSecureAPI('optimizeDayPlan', { day, preferences, prompt });
      return response.result;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to optimize day plan. Please try again.');
    }
  },

  async suggestDining(preferences: DiningPreferences): Promise<DiningSuggestion[]> {
    try {
      console.log('Frontend: Getting prompt for dining category...');
      const prompt = await getPromptByCategory('dining');
      console.log('Frontend: Retrieved prompt for dining:', prompt);
      console.log('Frontend: Prompt name:', prompt?.name);
      console.log('Frontend: Prompt system message:', prompt?.systemMessage?.substring(0, 100) + '...');
      
      const response = await callSecureAPI('suggestDining', { preferences, prompt });
      console.log('Frontend: API response received:', response);
      return response.result;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate dining suggestions. Please try again.');
    }
  },

  async suggestRides(preferences: RidePreferences): Promise<RideSuggestion[]> {
    try {
      const prompt = await getPromptByCategory('rides');
      const response = await callSecureAPI('suggestRides', { preferences, prompt });
      return response.result;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate ride suggestions. Please try again.');
    }
  },

  async generateTripSummary(trip: Trip): Promise<string> {
    try {
      const prompt = await getPromptByCategory('summary');
      const response = await callSecureAPI('generateTripSummary', { trip, prompt });
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
      tips: ['AI optimization is temporarily unavailable'],
      warnings: ['Please try again later'],
      alternativeOptions: []
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

export const importTripFromFile = async (fileContent: string): Promise<any> => {
  const apiUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api/openai'
    : '/api/openai';

  console.log('📁 Sending file to AI for parsing...');
  console.log('📁 File content length:', fileContent.length);
  console.log('📁 API URL:', apiUrl);
  
  try {
    const requestBody = JSON.stringify({
      type: 'import',
      fileContent: fileContent,
    });
    
    console.log('📤 Request body length:', requestBody.length);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        console.error('❌ Failed to parse error response as JSON:', jsonError);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    let result;
    const responseText = await response.text();
    try {
      console.log('📥 Raw response text length:', responseText.length);
      console.log('📥 Raw response preview:', responseText.substring(0, 200) + '...');
      
      result = JSON.parse(responseText);
      console.log('✅ Frontend JSON parsing successful');
    } catch (parseError) {
      console.error('❌ Frontend JSON parse error:', parseError);
      console.error('❌ Response that failed to parse:', responseText);
      throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }
    
    console.log('✅ AI parsing successful, returning:', result.data);
    return result.data;
  } catch (error) {
    console.error('🚨 AI import error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to process file with AI');
  }
}; 