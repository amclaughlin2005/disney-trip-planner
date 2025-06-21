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

export const getTrip = (id: string): Trip | null => {
  const trips = getTrips();
  return trips.find(trip => trip.id === id) || null;
};

export const deleteTrip = (id: string): void => {
  const trips = getTrips();
  const filteredTrips = trips.filter(trip => trip.id !== id);
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(filteredTrips));
};

export const createTrip = (
  name: string,
  startDate: string,
  endDate: string,
  resortId: string | null
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
    updatedAt: new Date().toISOString()
  };
  
  return trip;
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

export const importTrip = (file: File): Promise<Trip> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const trip: Trip = JSON.parse(result);
          // Generate new ID to avoid conflicts
          trip.id = `trip-${Date.now()}`;
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