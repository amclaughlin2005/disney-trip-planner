import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Plus, FolderOpen, Download, Upload, Trash2, Cloud, CloudOff, Crown } from 'lucide-react';
import { Trip, Resort, RESORTS } from '../types';
import { createTrip, exportTrip, importTrip, getTripsForUser } from '../utils/tripStorage';
import { storageService, isCloudStorageConfigured } from '../utils/cloudStorage';
import { formatDateSafe, getDaysBetween } from '../utils/dateUtils';
import { useUserManagement } from '../hooks/useUserManagement';

interface TripManagerProps {
  currentTrip: Trip | null;
  onTripSelect: (trip: Trip) => void;
  onTripCreate: (trip: Trip) => void;
}

const TripManager: React.FC<TripManagerProps> = ({
  currentTrip,
  onTripSelect,
  onTripCreate,
}) => {
  const { appUser, userAccount } = useUserManagement();
  const navigate = useNavigate();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTripList, setShowTripList] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    resortId: ''
  });

  useEffect(() => {
    if (appUser) {
      loadTrips();
    }
  }, [appUser?.clerkId, userAccount?.id]); // Only depend on stable IDs to prevent infinite loops

  const loadTrips = async () => {
    if (!appUser) return;
    
    setIsLoading(true);
    try {
      console.log('🎢 Loading trips for user and account...');
      
      // Load trips from storage service (cloud or local)
      let savedTrips: Trip[] = [];
      
      try {
        savedTrips = await storageService.getTrips();
      } catch (error) {
        console.warn('Cloud storage failed, falling back to local storage');
        // Fallback to account-scoped local storage
        savedTrips = getTripsForUser(appUser.clerkId, userAccount?.id);
      }
      
      // Filter trips for current user's access
      const userTrips = savedTrips.filter(trip => {
        return (userAccount && trip.accountId === userAccount.id) || 
               (trip.createdBy === appUser.clerkId) ||
               (trip.isPublic === true);
      });
      
      setTrips(userTrips);
      setIsCloudConnected(isCloudStorageConfigured());
      console.log(`🎉 Loaded ${userTrips.length} trips for user`);
    } catch (error) {
      console.error('Failed to load trips:', error);
      setTrips([]);
      setIsCloudConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appUser || !userAccount) {
      alert('You must be assigned to an account to create trips');
      return;
    }
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('End date must be after start date');
      return;
    }

    setIsLoading(true);
    try {
      const trip = createTrip(
        formData.name,
        formData.startDate,
        formData.endDate,
        formData.resortId || null,
        userAccount.id,
        appUser.clerkId
      );

      await storageService.saveTrip(trip);
      onTripCreate(trip);
      setShowCreateForm(false);
      setFormData({ name: '', startDate: '', endDate: '', resortId: '' });
      loadTrips();
    } catch (error) {
      console.error('Failed to save trip:', error);
      alert('Failed to save trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!appUser) return;
    
    const tripToDelete = trips.find(t => t.id === tripId);
    if (!tripToDelete) return;
    
    // Check permissions
    const canDelete = (userAccount && tripToDelete.accountId === userAccount.id) || 
                     (tripToDelete.createdBy === appUser.clerkId);
    
    if (!canDelete) {
      alert('You do not have permission to delete this trip');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this trip?')) {
      setIsLoading(true);
      try {
        await storageService.deleteTrip(tripId);
        loadTrips();
        if (currentTrip?.id === tripId) {
          // If deleting current trip, we might want to clear it
        }
      } catch (error) {
        console.error('Failed to delete trip:', error);
        alert('Failed to delete trip. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImportTrip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !appUser || !userAccount) return;
    
    setIsLoading(true);
    try {
      const trip = await importTrip(file, userAccount.id, appUser.clerkId);
      await storageService.saveTrip(trip);
      onTripCreate(trip);
      loadTrips();
      alert('Trip imported successfully!');
    } catch (error) {
      console.error('Failed to import trip:', error);
      alert(`Failed to import trip: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const canCreateTrips = (): boolean => {
    return !!(appUser && userAccount);
  };

  const getTripOwnershipInfo = (trip: Trip): string => {
    if (trip.createdBy === appUser?.clerkId) {
      return 'Created by you';
    } else if (trip.accountId === userAccount?.id) {
      return `Shared in ${userAccount.name}`;
    } else if (trip.isPublic) {
      return 'Public trip';
    }
    return 'Shared trip';
  };

  const getResortCategory = (category: string) => {
    switch (category) {
      case 'value': return 'Value Resort';
      case 'moderate': return 'Moderate Resort';
      case 'deluxe': return 'Deluxe Resort';
      case 'deluxe-villa': return 'Deluxe Villa Resort';
      case 'other': return 'Other Hotel';
      default: return 'Resort';
    }
  };

  const getTripDuration = (startDate: string, endDate: string) => {
    const days = getDaysBetween(startDate, endDate);
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  return (
    <div className="relative">
      {/* Header with Cloud Status and Admin Access */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-sm">
          {isCloudConnected ? (
            <>
              <Cloud size={16} className="text-green-600" />
              <span className="text-green-600">Vercel Blob storage connected</span>
            </>
          ) : (
            <>
              <CloudOff size={16} className="text-blue-600" />
              <span className="text-blue-600">Local storage (Cloud storage available in production)</span>
            </>
          )}
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-disney-blue"></div>
          )}
        </div>
        
        {/* Admin Panel Access for Super Admins */}
        {appUser?.isSuperAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
          >
            <Crown size={16} />
            <span>Admin Panel</span>
          </button>
        )}
      </div>

      {/* Trip Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={isLoading || !canCreateTrips()}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          title={!canCreateTrips() ? 'You must be assigned to an account to create trips' : ''}
        >
          <Plus size={16} />
          <span>New Trip</span>
        </button>
        
        <button
          onClick={() => setShowTripList(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium min-h-[44px]"
          title="View trips in modal format"
        >
          <FolderOpen size={16} />
          <span>Browse Trips</span>
        </button>

        {currentTrip && (
          <button
            onClick={() => exportTrip(currentTrip)}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-disney-purple text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium min-h-[44px]"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        )}

        <label className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-disney-orange text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer text-sm font-medium min-h-[44px]">
          <Upload size={16} />
          <span>Import</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportTrip}
            className="hidden"
          />
        </label>
      </div>

      {/* Current Trip Display */}
      {currentTrip && (
        <div className="mt-4 p-3 sm:p-4 bg-disney-blue bg-opacity-10 rounded-lg border border-disney-blue border-opacity-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{currentTrip.name}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600 mt-1">
                <span className="flex items-center space-x-1">
                  <Calendar size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {formatDateSafe(currentTrip.startDate, 'MMM d')} - {formatDateSafe(currentTrip.endDate, 'MMM d, yyyy')}
                  </span>
                </span>
                <span className="hidden sm:inline">({getTripDuration(currentTrip.startDate, currentTrip.endDate)})</span>
                {currentTrip.resort && (
                  <span className="flex items-center space-x-1">
                    <MapPin size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span className="truncate">{currentTrip.resort.name}</span>
                  </span>
                )}
              </div>
              <div className="sm:hidden mt-1 text-xs text-gray-500">
                {getTripDuration(currentTrip.startDate, currentTrip.endDate)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Trips Tiles */}
      {trips.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Saved Trips</h3>
            <span className="text-sm text-gray-500">{trips.length} trip{trips.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className={`group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2 cursor-pointer overflow-hidden ${
                  currentTrip?.id === trip.id
                    ? 'border-disney-blue bg-disney-blue bg-opacity-5 ring-2 ring-disney-blue ring-opacity-20'
                    : 'border-gray-200 hover:border-disney-blue hover:border-opacity-50'
                }`}
                onClick={() => {
                  onTripSelect(trip);
                }}
              >
                {/* Trip Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-base truncate group-hover:text-disney-blue transition-colors">
                        {trip.name}
                      </h4>
                      <div className="mt-1 text-sm text-gray-600">
                        {formatDateSafe(trip.startDate, 'MMM d')} - {formatDateSafe(trip.endDate, 'MMM d, yyyy')}
                      </div>
                    </div>
                    {currentTrip?.id === trip.id && (
                      <div className="ml-2 px-2 py-1 bg-disney-blue text-white text-xs rounded-full font-medium">
                        Active
                      </div>
                    )}
                  </div>
                </div>

                {/* Trip Details */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1 text-gray-600">
                        <Calendar size={14} />
                        <span>{getTripDuration(trip.startDate, trip.endDate)}</span>
                      </span>
                      {trip.days.length > 0 && (
                        <span className="text-disney-green font-medium">
                          {trip.days.length} day{trip.days.length !== 1 ? 's' : ''} planned
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {trip.resort && (
                    <div className="mt-2 flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span className="truncate">{trip.resort.name}</span>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    {getTripOwnershipInfo(trip)}
                  </div>
                </div>

                {/* Action Button */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrip(trip.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete trip"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-disney-blue to-disney-purple opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State for No Trips */}
      {trips.length === 0 && !isLoading && (
        <div className="mt-8 text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
          <p className="text-gray-600 mb-6">Create your first Disney trip to get started planning your magical vacation!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={!canCreateTrips()}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canCreateTrips() ? 'You must be assigned to an account to create trips' : ''}
          >
            <Plus size={20} />
            <span>Create Your First Trip</span>
          </button>
        </div>
      )}

      {/* Create Trip Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Create New Trip</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue text-base"
                  placeholder="e.g., Smith Family Disney Trip 2024"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resort (Optional)
                </label>
                <select
                  value={formData.resortId}
                  onChange={(e) => setFormData({ ...formData, resortId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue text-base"
                >
                  <option value="">Select a resort (optional)</option>
                  {Object.entries(
                    RESORTS.reduce((acc, resort) => {
                      if (!acc[resort.category]) acc[resort.category] = [];
                      acc[resort.category].push(resort);
                      return acc;
                    }, {} as Record<string, Resort[]>)
                  ).map(([category, resorts]) => (
                    <optgroup key={category} label={getResortCategory(category)}>
                      {resorts.map((resort) => (
                        <option key={resort.id} value={resort.id}>
                          {resort.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium min-h-[44px]"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trip List Modal */}
      {showTripList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Browse Your Trips</h2>
              <button
                onClick={() => setShowTripList(false)}
                className="text-gray-400 hover:text-gray-600 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {trips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No saved trips found</p>
                  <p className="text-xs sm:text-sm mt-1">Create your first trip to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                        currentTrip?.id === trip.id
                          ? 'border-disney-blue bg-disney-blue bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        onTripSelect(trip);
                        setShowTripList(false);
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{trip.name}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600 mt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar size={12} className="flex-shrink-0" />
                              <span>
                                {formatDateSafe(trip.startDate, 'MMM d')} - {formatDateSafe(trip.endDate, 'MMM d, yyyy')}
                              </span>
                            </span>
                            <span className="hidden sm:inline">({getTripDuration(trip.startDate, trip.endDate)})</span>
                            {trip.resort && (
                              <span className="flex items-center space-x-1">
                                <MapPin size={12} className="flex-shrink-0" />
                                <span className="truncate">{trip.resort.name}</span>
                              </span>
                            )}
                          </div>
                          <div className="sm:hidden mt-1 text-xs text-gray-500">
                            {getTripDuration(trip.startDate, trip.endDate)} • {trip.days.length} days planned
                          </div>
                          <div className="mt-1 text-xs text-blue-600">
                            {getTripOwnershipInfo(trip)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrip(trip.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Delete trip"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripManager; 