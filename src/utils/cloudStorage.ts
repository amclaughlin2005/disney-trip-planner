import { put, del, list } from '@vercel/blob';
import { Trip } from '../types';

// Check if Vercel Blob is configured
const isVercelBlobConfigured = (): boolean => {
  return !!(process.env.REACT_APP_BLOB_READ_WRITE_TOKEN);
};

console.log(isVercelBlobConfigured() ? 'Vercel Blob configured' : 'Vercel Blob not configured - using local storage only');

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
      const blob = await put(blobName, JSON.stringify(tripData), {
        access: 'public',
        token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN!
      });
      
      console.log('Trip saved to Vercel Blob:', trip.id, blob.url);
    } catch (error) {
      console.error('Error saving trip to Vercel Blob:', error);
      throw new Error('Failed to save trip to cloud storage');
    }
  },

  async getTrips(): Promise<Trip[]> {
    if (!isVercelBlobConfigured()) {
      throw new Error('Vercel Blob not configured');
    }
    
    try {
      const deviceId = getDeviceId();
      const prefix = `trips/${deviceId}/`;
      
      // List all trip files for this device
      const { blobs } = await list({
        prefix,
        token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN!
      });
      
      const trips: Trip[] = [];
      
      // Fetch each trip file
      for (const blob of blobs) {
        try {
          const response = await fetch(blob.url);
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
      
      return trips;
    } catch (error) {
      console.error('Error loading trips from Vercel Blob:', error);
      throw new Error('Failed to load trips from cloud storage');
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
        token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN!
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
        token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN!
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