import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Crown, Calendar, Plus, List, Grid, Bot, Sparkles, Users } from 'lucide-react';
import { format } from 'date-fns';
import AuthWrapper from './components/AuthWrapper';
import TripManager from './components/TripManager';
import TripDayCard from './components/TripDayCard';
import AddDayModal from './components/AddDayModal';
import AgendaView from './components/AgendaView';
import AIAssistant from './components/AIAssistant';
import ProfileManager from './components/ProfileManager';
import { AdminPanel } from './components/AdminPanel';
import AccountSetup from './components/AccountSetup';
import WelcomeNewUser from './components/WelcomeNewUser';
import { useUserManagement } from './hooks/useUserManagement';
import { storageService } from './utils/cloudStorage';
import { Trip, TripDay, Park, AccountProfile } from './types';
import { getTripAssignedProfiles } from './utils/tripStorage';
import './index.css';

// Main App Component (Trip Planning Interface)
const MainApp: React.FC = () => {
  const { user: clerkUser } = useUser();
  const { 
    appUser, 
    userAccount, 
    loading,
    needsAccountSetup,
    isImpersonating,
    impersonatedUser,
    impersonatedAccount
  } = useUserManagement();

  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [tripDays, setTripDays] = useState<TripDay[]>([]);
  const [assignedProfilesCount, setAssignedProfilesCount] = useState(0);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [viewMode, setViewMode] = useState<'detailed' | 'agenda' | 'profiles'>('detailed');
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    if (appUser) {
      console.log('Debug - appUser:', appUser);
      console.log('Debug - appUser.isSuperAdmin:', appUser.isSuperAdmin);
      console.log('Debug - appUser.email:', appUser.email);
    }
  }, [appUser]);

  // Update trip days and assigned profiles when current trip changes
  useEffect(() => {
    if (currentTrip) {
      setTripDays(currentTrip.days);
      
      // Get assigned profiles count
      if (userAccount) {
        const assignedProfiles = getTripAssignedProfiles(currentTrip.id, appUser?.clerkId || '', userAccount.id);
        setAssignedProfilesCount(assignedProfiles.length);
      }
    } else {
      setTripDays([]);
      setAssignedProfilesCount(0);
    }
  }, [currentTrip, userAccount, appUser]);

  // Show loading state while user data is being initialized
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-disney-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your Disney Trip Planner...</p>
        </div>
      </div>
    );
  }

  // PRIORITY: Show account setup immediately after user profile creation
  if (clerkUser && appUser && needsAccountSetup && !appUser.isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <span className="text-2xl">🏰</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Welcome {appUser.name}!
              </h1>
              <p className="text-gray-600">
                Your Disney Trip Planner profile has been created successfully.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Signed in as: <span className="font-medium">{appUser.email}</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-disney-blue to-disney-purple text-white rounded-lg p-6">
              <Sparkles className="h-8 w-8 mx-auto mb-3" />
              <h2 className="text-xl font-semibold mb-2">
                One More Step - Create Your Account!
              </h2>
              <p className="text-blue-100">
                Let's set up your personal Disney planning account so you can start creating magical vacation itineraries.
              </p>
            </div>
          </div>

          {/* Account Setup Component */}
          <AccountSetup mode="welcome" />
        </div>
      </div>
    );
  }

  // Show welcome screen for new users who don't have an account yet (fallback case)
  if (clerkUser && appUser && !userAccount && !appUser.isSuperAdmin) {
    return <WelcomeNewUser />;
  }

  // Show message if user doesn't have access to any account and is not a super admin
  if (appUser && !userAccount && !isImpersonating && !appUser.isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Access Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be assigned to an account to access the Disney Trip Planner. 
            {appUser.isSuperAdmin 
              ? ' As a super admin, you can access the admin panel to assign yourself to an account.'
              : ' Please contact your administrator to get access.'
            }
          </p>
          <div className="text-sm text-gray-500 mb-6">
            Logged in as: {appUser.name} ({appUser.email})
          </div>
          
          {/* Admin Panel Access for Super Admins */}
          {appUser.isSuperAdmin && (
            <button
              onClick={() => {
                console.log('Admin panel button clicked!');
                console.log('Current URL:', window.location.href);
                console.log('Attempting navigation to /admin');
                
                // Try multiple navigation methods
                try {
                  // Method 1: React Router navigate
                  navigate('/admin');
                  console.log('React Router navigate called');
                } catch (error) {
                  console.error('React Router navigation failed:', error);
                  
                  // Method 2: Direct URL manipulation
                  try {
                    const baseUrl = window.location.origin;
                    const adminUrl = `${baseUrl}/admin`;
                    console.log('Trying direct navigation to:', adminUrl);
                    window.location.href = adminUrl;
                  } catch (error2) {
                    console.error('Direct navigation failed:', error2);
                    
                    // Method 3: History API
                    try {
                      window.history.pushState({}, '', '/admin');
                      window.location.reload();
                    } catch (error3) {
                      console.error('History API failed:', error3);
                    }
                  }
                }
              }}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
              <Crown className="h-5 w-5" />
              <span>Access Admin Panel</span>
            </button>
          )}
          
          {/* Show debug info */}
          <div className="mt-4 text-xs text-gray-400">
            Debug: isSuperAdmin = {String(appUser.isSuperAdmin)}
          </div>
          
          {/* Test direct link */}
          {appUser.isSuperAdmin && (
            <div className="mt-2">
              <a 
                href="/admin" 
                className="text-xs text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Test: Direct link to /admin (opens in new tab)
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleTripSelect = (trip: Trip) => {
    setCurrentTrip(trip);
  };

  const handleTripCreate = (trip: Trip) => {
    setCurrentTrip(trip);
  };

  const handleAddDay = (date: Date, park: Park | null) => {
    const newDay: TripDay = {
      id: `day-${Date.now()}`,
      date: format(date, 'yyyy-MM-dd'),
      park,
      transportation: [],
      rides: [],
      reservations: [],
      food: [],
    };
    
    const newTripDays = [...tripDays, newDay].sort((a, b) => a.date.localeCompare(b.date));
    setTripDays(newTripDays);
    
    // Update currentTrip and save
    if (currentTrip) {
      const updatedTrip = { ...currentTrip, days: newTripDays };
      setCurrentTrip(updatedTrip);
      storageService.saveTrip(updatedTrip).catch(console.error);
    }
    
    setShowAddDayModal(false);
  };

  const handleUpdateDay = (dayId: string, updates: Partial<TripDay>) => {
    const newTripDays = tripDays.map(day => day.id === dayId ? { ...day, ...updates } : day);
    setTripDays(newTripDays);
    
    // Update currentTrip and save
    if (currentTrip) {
      const updatedTrip = { ...currentTrip, days: newTripDays };
      setCurrentTrip(updatedTrip);
      storageService.saveTrip(updatedTrip).catch(console.error);
    }
  };

  const handleDeleteDay = (dayId: string) => {
    if (window.confirm('Are you sure you want to delete this day?')) {
      const newTripDays = tripDays.filter(day => day.id !== dayId);
      setTripDays(newTripDays);
      
      // Update currentTrip and save
      if (currentTrip) {
        const updatedTrip = { ...currentTrip, days: newTripDays };
        setCurrentTrip(updatedTrip);
        storageService.saveTrip(updatedTrip).catch(console.error);
      }
    }
  };

  // Profile Management Handlers
  const handleProfilesChange = () => {
    // Refresh current trip from storage to pick up profile assignment changes
    if (currentTrip && userAccount) {
      storageService.getTrip(currentTrip.id).then(updatedTrip => {
        if (updatedTrip) {
          setCurrentTrip(updatedTrip);
        }
      }).catch(console.error);
      
      // Update assigned profiles count
      const assignedProfiles = getTripAssignedProfiles(currentTrip.id, appUser?.clerkId || '', userAccount.id);
      setAssignedProfilesCount(assignedProfiles.length);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium">
          🔍 Super Admin View: Currently viewing as {impersonatedUser?.name || 'Unknown User'}
          {impersonatedAccount && ` (${impersonatedAccount.name})`}
        </div>
      )}
      
      {/* Main Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Disney Trip Planner</h1>
                {userAccount && (
                  <p className="text-sm text-gray-600">
                    {userAccount.name} • {appUser?.role || 'Member'}
                    {isImpersonating && (
                      <span className="text-orange-600 ml-2">
                        (Impersonated View)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Welcome, {appUser?.name || 'User'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <TripManager
          currentTrip={currentTrip}
          onTripSelect={handleTripSelect}
          onTripCreate={handleTripCreate}
        />

        {/* Trip Planning Interface */}
        {currentTrip && (
          <>
            {/* Trip Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{currentTrip.name}</h2>
                  <p className="text-gray-600">
                    {format(new Date(currentTrip.startDate), 'MMM d, yyyy')} - {format(new Date(currentTrip.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  <button
                    onClick={() => setShowAddDayModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Day</span>
                  </button>
                  
                  <button
                    onClick={() => setShowAIAssistant(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-disney-purple text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Bot size={16} />
                    <span>AI Assistant</span>
                  </button>

                  <div className="flex rounded-lg overflow-hidden border border-gray-300">
                    <button
                      onClick={() => setViewMode('detailed')}
                      className={`flex items-center space-x-1 px-3 py-2 text-sm ${
                        viewMode === 'detailed' 
                          ? 'bg-disney-blue text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Grid size={14} />
                      <span>Detailed</span>
                    </button>
                    <button
                      onClick={() => setViewMode('agenda')}
                      className={`flex items-center space-x-1 px-3 py-2 text-sm ${
                        viewMode === 'agenda' 
                          ? 'bg-disney-blue text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <List size={14} />
                      <span>Agenda</span>
                    </button>
                    <button
                      onClick={() => setViewMode('profiles')}
                      className={`flex items-center space-x-1 px-3 py-2 text-sm ${
                        viewMode === 'profiles' 
                          ? 'bg-disney-blue text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Users size={14} />
                      <span>Profiles</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Trip Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-disney-blue">{tripDays.length}</div>
                  <div className="text-sm text-gray-600">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-disney-pink">{assignedProfilesCount}</div>
                  <div className="text-sm text-gray-600">People</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-disney-green">
                    {tripDays.reduce((sum, day) => sum + day.rides.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Rides</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-disney-purple">
                    {tripDays.reduce((sum, day) => sum + day.reservations.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Reservations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-disney-orange">
                    {tripDays.reduce((sum, day) => sum + day.food.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Dining</div>
                </div>
              </div>
            </div>

            {/* Trip Content */}
            {viewMode === 'detailed' ? (
              <div className="space-y-6">
                {tripDays.map((day) => (
                  <TripDayCard
                    key={day.id}
                    day={day}
                    onUpdate={(updates: Partial<TripDay>) => handleUpdateDay(day.id, updates)}
                    onDelete={() => handleDeleteDay(day.id)}
                  />
                ))}
                {tripDays.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No days planned yet</h3>
                    <p className="text-gray-600 mb-4">Start planning your magical Disney vacation!</p>
                    <button
                      onClick={() => setShowAddDayModal(true)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Add Your First Day</span>
                    </button>
                  </div>
                )}
              </div>
            ) : viewMode === 'agenda' ? (
              <AgendaView days={tripDays} />
            ) : (
              userAccount && (
                <ProfileManager
                  accountId={userAccount.id}
                  userId={appUser?.clerkId || ''}
                  trip={currentTrip}
                  onProfilesChange={handleProfilesChange}
                />
              )
            )}

            {/* Modals */}
            {showAddDayModal && (
              <AddDayModal
                onAdd={handleAddDay}
                onClose={() => setShowAddDayModal(false)}
                existingDates={tripDays.map(day => new Date(day.date + 'T00:00:00'))}
              />
            )}

            {showAIAssistant && (
              <AIAssistant
                currentTrip={currentTrip}
                onClose={() => setShowAIAssistant(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Admin Route Component
const AdminRoute: React.FC = () => {
  const { appUser, loading } = useUserManagement();
  
  // Debug logging for admin route
  console.log('AdminRoute - appUser:', appUser);
  console.log('AdminRoute - appUser?.isSuperAdmin:', appUser?.isSuperAdmin);
  console.log('AdminRoute - loading:', loading);
  
  // Show loading while user data is being fetched
  if (loading) {
    console.log('AdminRoute - Still loading user data');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-disney-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }
  
  // Only super admins can access admin panel
  if (!appUser?.isSuperAdmin) {
    console.log('AdminRoute - Redirecting to home because user is not super admin');
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute - Rendering AdminPanel');
  return <AdminPanel />;
};

// Main App with Router
const App: React.FC = () => {
  return (
    <AuthWrapper>
      <Router>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthWrapper>
  );
};

export default App; 