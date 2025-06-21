import { put, del, list } from '@vercel/blob';
import { Trip } from '../types';

// Check if Vercel Blob is configured and we're in production
// Get the Vercel Blob token from environment
const getBlobToken = (): string | undefined => {
  // In production, Vercel automatically provides BLOB_READ_WRITE_TOKEN
  // In development, we use REACT_APP_BLOB_READ_WRITE_TOKEN
  return process.env.BLOB_READ_WRITE_TOKEN || process.env.REACT_APP_BLOB_READ_WRITE_TOKEN;
};

const isVercelBlobConfigured = (): boolean => {
  // Vercel Blob only works in production due to CORS restrictions
  const isProduction = process.env.NODE_ENV === 'production';
  const token = getBlobToken();
  const hasValidToken = !!(token && token.startsWith('vercel_blob_rw_'));
  const isConfigured = isProduction && hasValidToken;
  
  console.log('Vercel Blob configuration check:', {
    isProduction,
    hasValidToken: hasValidToken ? `${token!.substring(0, 20)}...` : 'No token',
    tokenSource: process.env.BLOB_READ_WRITE_TOKEN ? 'BLOB_READ_WRITE_TOKEN' : 'REACT_APP_BLOB_READ_WRITE_TOKEN',
    isConfigured
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

// Vercel Blob implementation
export const vercelBlobStorage: CloudStorageService = {
  async saveTrip(trip: Trip): Promise<void> {
    if (!isVercelBlobConfigured()) {
      throw new Error('Vercel Blob not configured');
    }
    
    try {
      const deviceId = getDeviceId();
      const tripData = {
        ...trip,
        deviceId,
        updatedAt: new Date().toISOString(),
        createdAt: trip.createdAt || new Date().toISOString()
      };
      
      // Store trip as JSON blob with device-specific path
      const blobName = `trips/${deviceId}/${trip.id}.json`;
      const blob = await withTimeout(
        put(blobName, JSON.stringify(tripData), {
          access: 'public',
          token: getBlobToken()!
        }),
        10000 // 10 second timeout
      );
      
      console.log('Trip saved to Vercel Blob:', trip.id, blob.url);
    } catch (error) {
      console.error('Error saving trip to Vercel Blob:', error);
      throw new Error(`Failed to save trip to cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getTrips(): Promise<Trip[]> {
    if (!isVercelBlobConfigured()) {
      throw new Error('Vercel Blob not configured');
    }
    
    try {
      const deviceId = getDeviceId();
      const prefix = `trips/${deviceId}/`;
      
      console.log('Loading trips from Vercel Blob for device:', deviceId);
      
      // List all trip files for this device with timeout
      const { blobs } = await withTimeout(
        list({
          prefix,
          token: getBlobToken()!
        }),
        10000 // 10 second timeout
      );
      
      console.log(`Found ${blobs.length} trip files in Vercel Blob`);
      
      const trips: Trip[] = [];
      
      // Fetch each trip file
      for (const blob of blobs) {
        try {
          const response = await withTimeout(fetch(blob.url), 5000); // 5 second timeout per file
          if (response.ok) {
            const tripData = await response.json();
            trips.push(tripData as Trip);
          }
        } catch (error) {
          console.error('Error fetching trip blob:', blob.pathname, error);
        }
      }
      
      // Sort by updatedAt descending
      trips.sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      
      console.log(`Successfully loaded ${trips.length} trips from Vercel Blob`);
      return trips;
    } catch (error) {
      console.error('Error loading trips from Vercel Blob:', error);
      throw new Error(`Failed to load trips from cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getTrip(id: string): Promise<Trip | null> {
    if (!isVercelBlobConfigured()) {
      throw new Error('Vercel Blob not configured');
    }
    
    try {
      const deviceId = getDeviceId();
      const blobName = `trips/${deviceId}/${id}.json`;
      
      // List to check if the blob exists
      const { blobs } = await list({
        prefix: blobName,
        token: getBlobToken()!
      });
      
      if (blobs.length === 0) {
        return null;
      }
      
      // Fetch the trip data
      const response = await fetch(blobs[0].url);
      if (response.ok) {
        const tripData = await response.json();
        return tripData as Trip;
      }
      
      return null;
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
      const blobName = `trips/${deviceId}/${id}.json`;
      
      await del(blobName, {
        token: getBlobToken()!
      });
      
      console.log('Trip deleted from Vercel Blob:', id);
    } catch (error) {
      console.error('Error deleting trip from Vercel Blob:', error);
      throw new Error('Failed to delete trip from cloud storage');
    }
  },

  subscribeToTrips(callback: (trips: Trip[]) => void): Unsubscribe {
    // Vercel Blob doesn't have real-time subscriptions like Firestore
    // We'll implement a polling mechanism
    let intervalId: NodeJS.Timeout;
    
    const pollTrips = async () => {
      try {
        const trips = await this.getTrips();
        callback(trips);
      } catch (error) {
        console.error('Error in trips polling:', error);
      }
    };
    
    // Initial call
    pollTrips();
    
    // Poll every 30 seconds
    intervalId = setInterval(pollTrips, 30000);
    
    // Return unsubscribe function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
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