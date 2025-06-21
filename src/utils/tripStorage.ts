import { Trip, TripDay } from '../types';
import { addDays, format } from 'date-fns';
import { parseDateString } from './dateUtils';

const TRIPS_STORAGE_KEY = 'disney-trip-planner-trips';

export const saveTrip = (trip: Trip): void => {
  const trips = getTrips();
  const existingIndex = trips.findIndex(t => t.id === trip.id);
  
  const updatedTrip = {
    ...trip,
    updatedAt: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    trips[existingIndex] = updatedTrip;
  } else {
    trips.push(updatedTrip);
  }
  
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
};

export const getTrips = (): Trip[] => {
  try {
    const stored = localStorage.getItem(TRIPS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading trips from storage:', error);
    return [];
  }
};

export const getTripsByAccount = (accountId: string): Trip[] => {
  const trips = getTrips();
  return trips.filter(trip => trip.accountId === accountId);
};

export const getTripsForUser = (userId: string, accountId?: string): Trip[] => {
  const trips = getTrips();
  return trips.filter(trip => {
    // User can see trips from their account or public trips they created
    return (accountId && trip.accountId === accountId) || 
           (trip.createdBy === userId) ||
           (trip.isPublic === true);
  });
};

export const getTrip = (id: string): Trip | null => {
  const trips = getTrips();
  return trips.find(trip => trip.id === id) || null;
};

export const getTripWithPermissionCheck = (id: string, userId: string, accountId?: string): Trip | null => {
  const trip = getTrip(id);
  if (!trip) return null;
  
  // Check if user has permission to view this trip
  const hasPermission = (accountId && trip.accountId === accountId) || 
                       (trip.createdBy === userId) ||
                       (trip.isPublic === true);
  
  return hasPermission ? trip : null;
};

export const deleteTrip = (id: string): void => {
  const trips = getTrips();
  const filteredTrips = trips.filter(trip => trip.id !== id);
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(filteredTrips));
};

export const deleteTripWithPermissionCheck = (id: string, userId: string, accountId?: string): boolean => {
  const trip = getTrip(id);
  if (!trip) return false;
  
  // Check if user has permission to delete this trip
  const hasPermission = (accountId && trip.accountId === accountId) || 
                       (trip.createdBy === userId);
  
  if (hasPermission) {
    deleteTrip(id);
    return true;
  }
  
  return false;
};

export const createTrip = (
  name: string,
  startDate: string,
  endDate: string,
  resortId: string | null,
  accountId: string,
  createdBy: string
): Trip => {
  const { RESORTS } = require('../types');
  const resort = resortId ? RESORTS.find((r: any) => r.id === resortId) || null : null;
  
  // Generate trip days
  const days: TripDay[] = [];
  
  // Parse dates using utility function to avoid timezone issues
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);
  
  let currentDate = start;
  
  while (currentDate <= end) {
    days.push({
      id: `day-${format(currentDate, 'yyyy-MM-dd')}`,
      date: format(currentDate, 'yyyy-MM-dd'),
      park: null,
      transportation: [],
      rides: [],
      reservations: [],
      food: []
    });
    currentDate = addDays(currentDate, 1);
  }
  
  const trip: Trip = {
    id: `trip-${Date.now()}`,
    name,
    startDate,
    endDate,
    resort,
    days,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accountId: accountId,
    createdBy: createdBy,
    isPublic: false
  };
  
  return trip;
};

export const updateTripPermissions = (tripId: string, isPublic: boolean, userId: string, accountId?: string): boolean => {
  const trip = getTrip(tripId);
  if (!trip) return false;
  
  // Check if user has permission to update this trip
  const hasPermission = (accountId && trip.accountId === accountId) || 
                       (trip.createdBy === userId);
  
  if (hasPermission) {
    const updatedTrip = { ...trip, isPublic, updatedAt: new Date().toISOString() };
    saveTrip(updatedTrip);
    return true;
  }
  
  return false;
};

export const transferTripToAccount = (tripId: string, newAccountId: string, userId: string, currentAccountId?: string): boolean => {
  const trip = getTrip(tripId);
  if (!trip) return false;
  
  // Check if user has permission to transfer this trip (must be owner or creator)
  const hasPermission = (currentAccountId && trip.accountId === currentAccountId && trip.createdBy === userId) || 
                       (trip.createdBy === userId);
  
  if (hasPermission) {
    const updatedTrip = { ...trip, accountId: newAccountId, updatedAt: new Date().toISOString() };
    saveTrip(updatedTrip);
    return true;
  }
  
  return false;
};

export const exportTrip = (trip: Trip): void => {
  const dataStr = JSON.stringify(trip, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${trip.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_trip.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importTrip = (file: File, accountId: string, userId: string): Promise<Trip> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const trip: Trip = JSON.parse(result);
          // Generate new ID to avoid conflicts and assign to user's account
          trip.id = `trip-${Date.now()}`;
          trip.accountId = accountId;
          trip.createdBy = userId;
          trip.updatedAt = new Date().toISOString();
          resolve(trip);
        } else {
          reject(new Error('Invalid file content'));
        }
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}; 