import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseConfigured as checkFirebaseConfig } from '../config/firebase';
import { Trip } from '../types';

const TRIPS_COLLECTION = 'trips';

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

// Firebase implementation
export const firebaseStorage: CloudStorageService = {
  async saveTrip(trip: Trip): Promise<void> {
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      const deviceId = getDeviceId();
      const tripDoc = doc(db, TRIPS_COLLECTION, trip.id);
      
      const tripData = {
        ...trip,
        deviceId,
        updatedAt: serverTimestamp(),
        // Ensure createdAt exists
        createdAt: trip.createdAt || serverTimestamp()
      };
      
      await setDoc(tripDoc, tripData, { merge: true });
      console.log('Trip saved to cloud:', trip.id);
    } catch (error) {
      console.error('Error saving trip to cloud:', error);
      throw new Error('Failed to save trip to cloud storage');
    }
  },

  async getTrips(): Promise<Trip[]> {
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      const deviceId = getDeviceId();
      const tripsQuery = query(
        collection(db, TRIPS_COLLECTION),
        where('deviceId', '==', deviceId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(tripsQuery);
      const trips: Trip[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        trips.push({
          ...data,
          id: doc.id,
          // Convert Firestore timestamps to ISO strings
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        } as Trip);
      });
      
      return trips;
    } catch (error) {
      console.error('Error loading trips from cloud:', error);
      throw new Error('Failed to load trips from cloud storage');
    }
  },

  async getTrip(id: string): Promise<Trip | null> {
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      const tripDoc = doc(db, TRIPS_COLLECTION, id);
      const docSnap = await getDoc(tripDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        } as Trip;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading trip from cloud:', error);
      throw new Error('Failed to load trip from cloud storage');
    }
  },

  async deleteTrip(id: string): Promise<void> {
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      const tripDoc = doc(db, TRIPS_COLLECTION, id);
      await deleteDoc(tripDoc);
      console.log('Trip deleted from cloud:', id);
    } catch (error) {
      console.error('Error deleting trip from cloud:', error);
      throw new Error('Failed to delete trip from cloud storage');
    }
  },

  subscribeToTrips(callback: (trips: Trip[]) => void): Unsubscribe {
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    
    const deviceId = getDeviceId();
    const tripsQuery = query(
      collection(db, TRIPS_COLLECTION),
      where('deviceId', '==', deviceId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(tripsQuery, (querySnapshot) => {
      const trips: Trip[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        trips.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        } as Trip);
      });
      callback(trips);
    }, (error) => {
      console.error('Error in trips subscription:', error);
    });
  }
};

// Fallback to localStorage if Firebase is not configured
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

// Use the Firebase configuration check
export const storageService: CloudStorageService = checkFirebaseConfig() 
  ? firebaseStorage 
  : localStorageService; 