import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, User, Calendar, Heart, Star, Utensils, UserCheck, UserMinus } from 'lucide-react';
import { AccountProfile, Trip, DIETARY_PREFERENCES, RIDE_PREFERENCES, POPULAR_DISNEY_CHARACTERS, POPULAR_DISNEY_RIDES } from '../types';
import { 
  getAccountProfiles, 
  addAccountProfile, 
  updateAccountProfile, 
  deleteAccountProfile,
  assignProfileToTrip,
  unassignProfileFromTrip,
  getTripAssignedProfiles
} from '../utils/tripStorage';

interface ProfileManagerProps {
  accountId: string;
  userId: string;
  trip?: Trip; // Optional - if provided, shows assignment interface
  onProfilesChange?: () => void; // Callback when profiles change
}

interface ProfileFormData {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | '';
  dietaryPreferences: string[];
  ridePreferences: 'thrill-seeker' | 'family-friendly' | 'mild' | 'mixed' | '';
  favoriteCharacters: string[];
  favoriteRides: string[];
  lovesAboutDisney: string;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({
  accountId,
  userId,
  trip,
  onProfilesChange,
}) => {
  const [profiles, setProfiles] = useState<AccountProfile[]>([]);
  const [assignedProfiles, setAssignedProfiles] = useState<AccountProfile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AccountProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    age: '',
    gender: '',
    dietaryPreferences: [],
    ridePreferences: '',
    favoriteCharacters: [],
    favoriteRides: [],
    lovesAboutDisney: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadProfiles();
  }, [accountId, trip]);

  const loadProfiles = () => {
    const accountProfiles = getAccountProfiles(accountId);
    setProfiles(accountProfiles);
    
    if (trip) {
      const tripProfiles = getTripAssignedProfiles(trip.id, userId, accountId);
      setAssignedProfiles(tripProfiles);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: '',
      dietaryPreferences: [],
      ridePreferences: '',
      favoriteCharacters: [],
      favoriteRides: [],
      lovesAboutDisney: '',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 0 || age > 120) {
        newErrors.age = 'Please enter a valid age (0-120)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const profileData = {
      name: formData.name.trim(),
      age: parseInt(formData.age),
      gender: formData.gender || undefined,
      dietaryPreferences: formData.dietaryPreferences.length > 0 ? formData.dietaryPreferences : undefined,
      ridePreferences: formData.ridePreferences || undefined,
      favoriteCharacters: formData.favoriteCharacters.length > 0 ? formData.favoriteCharacters : undefined,
      favoriteRides: formData.favoriteRides.length > 0 ? formData.favoriteRides : undefined,
      lovesAboutDisney: formData.lovesAboutDisney.trim() || undefined,
    };

    try {
      if (editingProfile) {
        updateAccountProfile(accountId, editingProfile.id, profileData);
        setEditingProfile(null);
      } else {
        addAccountProfile(accountId, profileData);
        setShowAddModal(false);
      }

      resetForm();
      loadProfiles();
      onProfilesChange?.();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleEdit = (profile: AccountProfile) => {
    setFormData({
      name: profile.name,
      age: profile.age.toString(),
      gender: profile.gender || '',
      dietaryPreferences: profile.dietaryPreferences || [],
      ridePreferences: profile.ridePreferences || '',
      favoriteCharacters: profile.favoriteCharacters || [],
      favoriteRides: profile.favoriteRides || [],
      lovesAboutDisney: profile.lovesAboutDisney || '',
    });
    setEditingProfile(profile);
    setErrors({});
  };

  const handleDelete = (profile: AccountProfile) => {
    if (window.confirm(`Are you sure you want to delete ${profile.name}'s profile? This will remove them from all trips.`)) {
      try {
        deleteAccountProfile(accountId, profile.id);
        loadProfiles();
        onProfilesChange?.();
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowAddModal(false);
    setEditingProfile(null);
  };

  const handleArrayFieldChange = (field: 'dietaryPreferences' | 'favoriteCharacters' | 'favoriteRides', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleAssignToTrip = (profile: AccountProfile) => {
    if (!trip) return;
    
    try {
      assignProfileToTrip(trip.id, profile.id, userId, accountId);
      loadProfiles();
      onProfilesChange?.();
    } catch (error) {
      console.error('Error assigning profile to trip:', error);
    }
  };

  const handleUnassignFromTrip = (profile: AccountProfile) => {
    if (!trip) return;
    
    try {
      unassignProfileFromTrip(trip.id, profile.id, userId, accountId);
      loadProfiles();
      onProfilesChange?.();
    } catch (error) {
      console.error('Error unassigning profile from trip:', error);
    }
  };

  const getRidePreferenceColor = (preference: string) => {
    switch (preference) {
      case 'thrill-seeker': return 'text-red-600 bg-red-100';
      case 'family-friendly': return 'text-green-600 bg-green-100';
      case 'mild': return 'text-blue-600 bg-blue-100';
      case 'mixed': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAgeGroupIcon = (age: number) => {
    if (age < 3) return '👶';
    if (age < 13) return '🧒';
    if (age < 18) return '👦';
    if (age < 65) return '👤';
    return '👴';
  };

  const isProfileAssigned = (profile: AccountProfile) => {
    return assignedProfiles.some(ap => ap.id === profile.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-disney-blue" />
          <h2 className="text-xl font-semibold text-gray-900">
            {trip ? `Assign Participants to ${trip.name}` : 'Account Profiles'}
          </h2>
          <span className="bg-disney-blue text-white text-sm px-2 py-1 rounded-full">
            {trip ? assignedProfiles.length : profiles.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Person</span>
        </button>
      </div>

      {/* Trip Assignment View */}
      {trip && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Trip Assignment</h3>
          <p className="text-sm text-blue-700">
            Select which family members will be going on this trip. You can assign or unassign people at any time.
          </p>
          {assignedProfiles.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-blue-900">Currently assigned:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {assignedProfiles.map(profile => (
                  <span key={profile.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {profile.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles yet</h3>
          <p className="text-gray-600 mb-6">Create profiles for your family members to get personalized Disney recommendations!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {profiles.map((profile) => (
            <div key={profile.id} className={`rounded-xl p-4 relative group border-2 transition-all ${
              trip 
                ? isProfileAssigned(profile)
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getAgeGroupIcon(profile.age)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{profile.age} years old</span>
                      {profile.gender && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{profile.gender}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(profile)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(profile)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Trip Assignment Button */}
              {trip && (
                <div className="mb-3">
                  {isProfileAssigned(profile) ? (
                    <button
                      onClick={() => handleUnassignFromTrip(profile)}
                      className="flex items-center space-x-2 w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Assigned to Trip</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAssignToTrip(profile)}
                      className="flex items-center space-x-2 w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <UserMinus className="h-4 w-4" />
                      <span>Assign to Trip</span>
                    </button>
                  )}
                </div>
              )}

              {/* Profile Details */}
              <div className="space-y-2">
                {profile.ridePreferences && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-3 w-3 text-gray-400" />
                    <span className={`text-xs px-2 py-1 rounded-full ${getRidePreferenceColor(profile.ridePreferences)}`}>
                      {RIDE_PREFERENCES.find(r => r.value === profile.ridePreferences)?.label}
                    </span>
                  </div>
                )}
                
                {profile.dietaryPreferences && profile.dietaryPreferences.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Utensils className="h-3 w-3 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {profile.dietaryPreferences.slice(0, 2).map(pref => (
                        <span key={pref} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          {pref}
                        </span>
                      ))}
                      {profile.dietaryPreferences.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{profile.dietaryPreferences.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {profile.favoriteCharacters && profile.favoriteCharacters.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Heart className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      Loves {profile.favoriteCharacters.slice(0, 2).join(', ')}
                      {profile.favoriteCharacters.length > 2 && ` +${profile.favoriteCharacters.length - 2} more`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Profile Modal */}
      {(showAddModal || editingProfile) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingProfile ? `Edit ${editingProfile.name}'s Profile` : 'Add New Person'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <User className="h-4 w-4 text-disney-blue" />
                  <span>Basic Information</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent ${
                        errors.age ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                      max="120"
                    />
                    {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender (Optional)
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                  >
                    <option value="">Choose gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Utensils className="h-4 w-4 text-disney-orange" />
                  <span>Dietary Preferences (Optional)</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIETARY_PREFERENCES.map(pref => (
                    <label key={pref} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.dietaryPreferences.includes(pref)}
                        onChange={() => handleArrayFieldChange('dietaryPreferences', pref)}
                        className="rounded border-gray-300 text-disney-orange focus:ring-disney-orange"
                      />
                      <span className="text-sm text-gray-700">{pref}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ride Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Star className="h-4 w-4 text-disney-yellow" />
                  <span>Ride Preferences (Optional)</span>
                </h4>
                <div className="space-y-3">
                  {RIDE_PREFERENCES.map(pref => (
                    <label key={pref.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="ridePreferences"
                        value={pref.value}
                        checked={formData.ridePreferences === pref.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, ridePreferences: e.target.value as any }))}
                        className="text-disney-yellow focus:ring-disney-yellow"
                      />
                      <div>
                        <div className="font-medium text-sm text-gray-900">{pref.label}</div>
                        <div className="text-xs text-gray-600">{pref.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Favorite Characters */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-disney-pink" />
                  <span>Favorite Disney Characters (Optional)</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {POPULAR_DISNEY_CHARACTERS.map(character => (
                    <label key={character} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.favoriteCharacters.includes(character)}
                        onChange={() => handleArrayFieldChange('favoriteCharacters', character)}
                        className="rounded border-gray-300 text-disney-pink focus:ring-disney-pink"
                      />
                      <span className="text-sm text-gray-700">{character}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Favorite Rides */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Star className="h-4 w-4 text-disney-purple" />
                  <span>Favorite Disney Rides (Optional)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {POPULAR_DISNEY_RIDES.map(ride => (
                    <label key={ride} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.favoriteRides.includes(ride)}
                        onChange={() => handleArrayFieldChange('favoriteRides', ride)}
                        className="rounded border-gray-300 text-disney-purple focus:ring-disney-purple"
                      />
                      <span className="text-sm text-gray-700">{ride}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* What They Love About Disney */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-disney-gold" />
                  <span>What They Love About Disney (Optional)</span>
                </h4>
                <textarea
                  value={formData.lovesAboutDisney}
                  onChange={(e) => setFormData(prev => ({ ...prev, lovesAboutDisney: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                  rows={3}
                  placeholder="What makes Disney special for them? Characters, rides, shows, food, etc."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-disney-blue text-white hover:bg-blue-600 rounded-lg transition-colors"
                >
                  {editingProfile ? 'Update Profile' : 'Add Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManager; 