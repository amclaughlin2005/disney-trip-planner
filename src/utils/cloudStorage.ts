import { Trip } from '../types';

// Check if Vercel Blob is configured and we're in production
// Check if Vercel Blob is configured via API route
const getBlobToken = (): string | undefined => {
  // Since we're using API routes, we don't need client-side tokens
  // The API route handles the BLOB_READ_WRITE_TOKEN server-side
  // We just need to check if we're in production where the API route works
  return process.env.NODE_ENV === 'production' ? 'api-route-available' : undefined;
};

const isVercelBlobConfigured = (): boolean => {
  // Vercel Blob works via API routes in production
  const isProduction = process.env.NODE_ENV === 'production';
  const token = getBlobToken();
  const isConfigured = isProduction && !!token;
  
  console.log('Vercel Blob configuration check:', {
    isProduction,
    hasApiRoute: !!token,
    isConfigured,
    mode: 'API route (server-side BLOB_READ_WRITE_TOKEN)'
  });
  
  return isConfigured;
};

console.log(isVercelBlobConfigured() ? 'Vercel Blob configured for production' : 'Using local storage (Vercel Blob only works in production)');

// User ID - for now we'll use a simple device-based ID
// Later this can be replaced with actual user authentication
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('disney-planner-device-id');
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('disney-planner-device-id', deviceId);
  }
  return deviceId;
};

export interface CloudStorageService {
  saveTrip: (trip: Trip) => Promise<void>;
  getTrips: () => Promise<Trip[]>;
  getTrip: (id: string) => Promise<Trip | null>;
  deleteTrip: (id: string) => Promise<void>;
  subscribeToTrips: (callback: (trips: Trip[]) => void) => Unsubscribe;
}

// Type for unsubscribe function
export type Unsubscribe = () => void;

// Helper function to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    )
  ]);
};

// Vercel Blob implementation via API route
export const vercelBlobStorage: CloudStorageService = {
  async saveTrip(trip: Trip): Promise<void> {
    if (!isVercelBlobConfigured()) {
      throw new Error('Vercel Blob not configured');
    }
    
    try {
      const deviceId = getDeviceId();
      
      // Debug logging
      console.log('Attempting to save trip:', {
        id: trip.id,
        name: trip.name,
        daysCount: trip.days?.length || 0,
        hasValidId: !!trip.id,
        hasValidName: !!trip.name,
        tripKeys: Object.keys(trip)
      });
      
      const response = await withTimeout(
        fetch(`/api/blob?action=save&deviceId=${deviceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trip)
        }),
        10000 // 10 second timeout
      );
      
      if (!response.ok) {
        // Try to get error details from response
        let errorDetails = response.statusText;
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || errorData.details || response.statusText;
          console.error('Server error response:', errorData);
        } catch (e) {
          console.error('Could not parse error response as JSON');
        }
        throw new Error(`HTTP ${response.status}: ${errorDetails}`);
      }
      
      const result = await response.json();
      console.log('Trip saved to Vercel Blob:', trip.id, result.url);
    } catch (error) {
      console.error('Error saving trip to Vercel Blob:', error);
      // If we get network errors, fall back to local storage
      if (error instanceof Error && (
        error.message.includes('ERR_INSUFFICIENT_RESOURCES') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('CORS') ||
        error.message.includes('TypeError')
      )) {
        console.log('Network error during save, falling back to local storage');
        const { saveTrip } = await import('./tripStorage');
        saveTrip(trip);
        // Mark this as successful to prevent retries
        return;
      }
      throw new Error(`Failed to save trip to cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getTrips(): Promise<Trip[]> {
    if (!isVercelBlobConfigured()) {
      throw new Error('Vercel Blob not configured');
    }
    
    try {
      const deviceId = getDeviceId();
      
      console.log('Loading trips from Vercel Blob for device:', deviceId);
      
      const response = await withTimeout(
        fetch(`/api/blob?action=list&deviceId=${deviceId}`),
        10000 // 10 second timeout
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const trips = result.trips || [];
      
      console.log(`Successfully loaded ${trips.length} trips from Vercel Blob`);
      return trips;
    } catch (error) {
      console.error('Error loading trips from Vercel Blob:', error);
      // If we get ERR_INSUFFICIENT_RESOURCES or similar network errors, 
      // fall back to local storage to prevent infinite loops
      if (error instanceof Error && (
        error.message.includes('ERR_INSUFFICIENT_RESOURCES') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('CORS')
      )) {
        console.log('Network error detected, falling back to local storage');
        const { getTrips } = await import('./tripStorage');
        return getTrips();
      }
      throw new Error(`Failed to load trips from cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getTrip(id: string): Promise<Trip | null> {
    if (!isVercelBlobConfigured()) {
      throw new Error('Vercel Blob not configured');
    }
    
    try {
      // For now, we'll get all trips and find the one we want
      // This could be optimized with a dedicated API endpoint
      const trips = await this.getTrips();
      return trips.find(trip => trip.id === id) || null;
    } catch (error) {
      console.error('Error loading trip from Vercel Blob:', error);
      throw new Error('Failed to load trip from cloud storage');
    }
  },

  async deleteTrip(id: string): Promise<void> {
    if (!isVercelBlobConfigured()) {
      throw new Error('Vercel Blob not configured');
    }
    
    try {
      const deviceId = getDeviceId();
      
      const response = await fetch(`/api/blob?action=delete&deviceId=${deviceId}&tripId=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('Trip deleted from Vercel Blob:', id);
    } catch (error) {
      console.error('Error deleting trip from Vercel Blob:', error);
      throw new Error('Failed to delete trip from cloud storage');
    }
  },

  subscribeToTrips(callback: (trips: Trip[]) => void): Unsubscribe {
    // Vercel Blob doesn't have real-time subscriptions like Firestore
    // Temporarily disabled polling to prevent error loops
    console.log('Vercel Blob polling disabled to prevent error loops');
    
    // Just do initial call, no polling
    this.getTrips().then(callback).catch(error => {
      console.error('Error in initial trips load:', error);
      // Fall back to local storage on error
      import('./tripStorage').then(({ getTrips }) => {
        callback(getTrips());
      });
    });
    
    // Return no-op unsubscribe function
    return () => {};
  }
};

// Fallback to localStorage if Vercel Blob is not configured
export const localStorageService: CloudStorageService = {
  async saveTrip(trip: Trip): Promise<void> {
    const { saveTrip } = await import('./tripStorage');
    saveTrip(trip);
  },

  async getTrips(): Promise<Trip[]> {
    const { getTrips } = await import('./tripStorage');
    return getTrips();
  },

  async getTrip(id: string): Promise<Trip | null> {
    const { getTrip } = await import('./tripStorage');
    return getTrip(id);
  },

  async deleteTrip(id: string): Promise<void> {
    const { deleteTrip } = await import('./tripStorage');
    deleteTrip(id);
  },

  subscribeToTrips(callback: (trips: Trip[]) => void): Unsubscribe {
    // For localStorage, we'll just call the callback once
    this.getTrips().then(callback);
    // Return a no-op unsubscribe function
    return () => {};
  }
};

// Use Vercel Blob if configured, otherwise fallback to localStorage
export const storageService: CloudStorageService = isVercelBlobConfigured() 
  ? vercelBlobStorage 
  : localStorageService;

// Export configuration check for UI status
export const isCloudStorageConfigured = isVercelBlobConfigured; 