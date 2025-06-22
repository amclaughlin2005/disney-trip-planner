import { Trip, TripDay, Park, Resort, Transportation, Ride, Reservation, Food, PARKS, RESORTS, AccountProfile, UserAccount } from '../types';
import { addDays, format } from 'date-fns';
import { parseDateString } from './dateUtils';
import { v4 as uuidv4 } from 'uuid';

const TRIPS_STORAGE_KEY = 'disney-trip-planner-trips';
const ACCOUNTS_STORAGE_KEY = 'admin-accounts';

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
    assignedProfileIds: [], // Initialize with empty assigned profiles
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

export const createTripFromAIParsed = (
  aiData: any,
  accountId: string,
  createdBy: string
): Trip => {
  // Find matching resort
  const matchingResort = RESORTS.find(r => 
    r.name.toLowerCase().includes(aiData.resortName?.toLowerCase() || '') ||
    aiData.resortName?.toLowerCase().includes(r.name.toLowerCase()) 
  );

  // Convert AI days to TripDay format
  const tripDays: TripDay[] = aiData.days.map((aiDay: any) => {
    // Find matching park
    const matchingPark = PARKS.find(p => 
      p.name.toLowerCase().includes(aiDay.parkName?.toLowerCase() || '') ||
      aiDay.parkName?.toLowerCase().includes(p.name.toLowerCase())
    );

    // Convert transportation
    const transportation: Transportation[] = (aiDay.transportation || []).map((t: any) => ({
      id: uuidv4(),
      type: t.type,
      from: t.from,
      to: t.to,
      departureTime: t.departureTime,
      arrivalTime: t.arrivalTime,
      notes: t.notes || '',
      color: getTransportationColor(t.type)
    }));

    // Convert rides
    const rides: Ride[] = (aiDay.rides || []).map((r: any) => ({
      id: uuidv4(),
      name: r.name,
      park: r.park,
      type: r.type,
      priority: r.priority,
      timeSlot: r.timeSlot || '',
      duration: r.duration,
      fastPass: r.fastPass || false,
      geniePlus: r.geniePlus || false,
      notes: r.notes || '',
      color: getRideColor(r.type)
    }));

    // Convert reservations
    const reservations: Reservation[] = (aiDay.reservations || []).map((res: any) => ({
      id: uuidv4(),
      name: res.name,
      type: res.type,
      location: res.location,
      date: res.date,
      time: res.time,
      partySize: res.partySize,
      confirmationNumber: res.confirmationNumber || '',
      notes: res.notes || '',
      color: getReservationColor(res.type)
    }));

    // Convert food
    const food: Food[] = (aiDay.food || []).map((f: any) => ({
      id: uuidv4(),
      name: f.name,
      type: f.type,
      location: f.location,
      mealType: f.mealType,
      timeSlot: f.timeSlot || '',
      partySize: f.partySize,
      budget: f.budget,
      reservationNumber: f.reservationNumber || '',
      notes: f.notes || '',
      color: getFoodColor(f.type)
    }));

    return {
      id: uuidv4(),
      date: aiDay.date,
      park: matchingPark || null,
      transportation,
      rides,
      reservations,
      food
    };
  });

  // Create the trip
  return {
    id: uuidv4(),
    name: aiData.tripName,
    startDate: aiData.startDate,
    endDate: aiData.endDate,
    resort: matchingResort || null,
    assignedProfileIds: [], // Initialize with empty assigned profiles
    days: tripDays,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accountId,
    createdBy,
    isPublic: false
  };
};

// Helper functions to get colors for different categories
const getTransportationColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    bus: 'disney-blue',
    monorail: 'disney-purple',
    boat: 'disney-green',
    walking: 'disney-gray',
    uber: 'disney-orange',
    lyft: 'disney-pink',
    rental: 'disney-yellow',
    other: 'disney-gray'
  };
  return colorMap[type] || 'disney-gray';
};

const getRideColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    attraction: 'disney-blue',
    show: 'disney-purple',
    'character-meet': 'disney-pink',
    parade: 'disney-yellow',
    fireworks: 'disney-orange'
  };
  return colorMap[type] || 'disney-blue';
};

const getReservationColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    dining: 'disney-green',
    hotel: 'disney-blue',
    spa: 'disney-pink',
    tour: 'disney-purple',
    other: 'disney-gray'
  };
  return colorMap[type] || 'disney-gray';
};

const getFoodColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'quick-service': 'disney-yellow',
    'table-service': 'disney-green',
    'character-dining': 'disney-purple',
    snack: 'disney-orange',
    drink: 'disney-blue',
    dessert: 'disney-pink'
  };
  return colorMap[type] || 'disney-orange';
};

// Helper function to ensure backward compatibility with existing trips
const ensureAssignedProfileIds = (trip: Trip): string[] => {
  // If trip doesn't have assignedProfileIds, initialize it as empty array
  if (!trip.assignedProfileIds) {
    trip.assignedProfileIds = [];
    // Auto-save the migration
    saveTrip(trip);
  }
  return trip.assignedProfileIds;
};

// Account Profile Management Functions
export const getAccounts = (): UserAccount[] => {
  try {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading accounts from storage:', error);
    return [];
  }
};

export const saveAccount = (account: UserAccount): void => {
  const accounts = getAccounts();
  const existingIndex = accounts.findIndex(a => a.id === account.id);
  
  const updatedAccount = {
    ...account,
    updatedAt: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    accounts[existingIndex] = updatedAccount;
  } else {
    accounts.push(updatedAccount);
  }
  
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
};

export const getAccount = (id: string): UserAccount | null => {
  const accounts = getAccounts();
  return accounts.find(account => account.id === id) || null;
};

export const getAccountProfiles = (accountId: string): AccountProfile[] => {
  const account = getAccount(accountId);
  return account?.profiles || [];
};

export const addAccountProfile = (accountId: string, profile: Omit<AccountProfile, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>): AccountProfile => {
  const account = getAccount(accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  const newProfile: AccountProfile = {
    ...profile,
    id: uuidv4(),
    accountId: accountId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  account.profiles = [...(account.profiles || []), newProfile];
  saveAccount(account);
  
  return newProfile;
};

export const updateAccountProfile = (accountId: string, profileId: string, updates: Partial<Omit<AccountProfile, 'id' | 'accountId' | 'createdAt'>>): AccountProfile | null => {
  const account = getAccount(accountId);
  if (!account) return null;

  const profileIndex = account.profiles.findIndex(p => p.id === profileId);
  if (profileIndex === -1) return null;

  const updatedProfile: AccountProfile = {
    ...account.profiles[profileIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  account.profiles[profileIndex] = updatedProfile;
  saveAccount(account);
  
  return updatedProfile;
};

export const deleteAccountProfile = (accountId: string, profileId: string): boolean => {
  const account = getAccount(accountId);
  if (!account) return false;

  const originalLength = account.profiles.length;
  account.profiles = account.profiles.filter(p => p.id !== profileId);
  
  if (account.profiles.length === originalLength) return false;

  // Also remove this profile from any trips
  const trips = getTripsByAccount(accountId);
  trips.forEach(trip => {
    const assignedIds = ensureAssignedProfileIds(trip);
    if (assignedIds.includes(profileId)) {
      trip.assignedProfileIds = assignedIds.filter(id => id !== profileId);
      saveTrip(trip);
    }
  });

  saveAccount(account);
  return true;
};

export const assignProfileToTrip = (tripId: string, profileId: string, userId: string, accountId?: string): boolean => {
  const trip = getTripWithPermissionCheck(tripId, userId, accountId);
  if (!trip) return false;

  // Check if profile exists and belongs to the same account
  const profile = getAccountProfiles(trip.accountId).find(p => p.id === profileId);
  if (!profile) return false;

  // Check if already assigned
  const assignedIds = ensureAssignedProfileIds(trip);
  if (assignedIds.includes(profileId)) return true;

  trip.assignedProfileIds.push(profileId);
  saveTrip(trip);
  return true;
};

export const unassignProfileFromTrip = (tripId: string, profileId: string, userId: string, accountId?: string): boolean => {
  const trip = getTripWithPermissionCheck(tripId, userId, accountId);
  if (!trip) return false;

  const assignedIds = ensureAssignedProfileIds(trip);
  trip.assignedProfileIds = assignedIds.filter(id => id !== profileId);
  saveTrip(trip);
  return true;
};

export const getTripAssignedProfiles = (tripId: string, userId: string, accountId?: string): AccountProfile[] => {
  const trip = getTripWithPermissionCheck(tripId, userId, accountId);
  if (!trip) return [];

  const accountProfiles = getAccountProfiles(trip.accountId);
  const assignedIds = ensureAssignedProfileIds(trip);
  return accountProfiles.filter(profile => assignedIds.includes(profile.id));
}; 