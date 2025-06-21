import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Plus, List, Grid, Bot, Crown, Eye, LogOut } from 'lucide-react';
import { Trip, TripDay, Park } from './types';
import { storageService } from './utils/cloudStorage';
import TripDayCard from './components/TripDayCard';
import AddDayModal from './components/AddDayModal';
import Header from './components/Header';
import AgendaView from './components/AgendaView';
import TripManager from './components/TripManager';
import AIAssistant from './components/AIAssistant';
import AuthWrapper from './components/AuthWrapper';
import AdminPanel from './components/AdminPanel';
import AccountSetup from './components/AccountSetup';
import { useUserManagement } from './hooks/useUserManagement';

function AppContent() {
  const {
    appUser,
    userAccount,
    loading: userLoading,
    canAccessAdmin,
    needsAccount,
    hasPermission,
    isImpersonating,
    impersonatedUser,
    impersonatedAccount,
    stopImpersonation
  } = useUserManagement();

  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [tripDays, setTripDays] = useState<TripDay[]>([]);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [viewMode, setViewMode] = useState<'detailed' | 'agenda'>('detailed');
  const [showAdmin, setShowAdmin] = useState(false);
  const [needsAccountSetup, setNeedsAccountSetup] = useState(false);

  // Update trip days when current trip changes
  useEffect(() => {
    if (currentTrip) {
      setTripDays(currentTrip.days);
    } else {
      setTripDays([]);
    }
  }, [currentTrip]);

  // Save trip data whenever trip days change
  useEffect(() => {
    if (currentTrip && tripDays.length > 0 && hasPermission('trips:update')) {
      const updatedTrip = {
        ...currentTrip,
        days: tripDays,
      };
      storageService.saveTrip(updatedTrip).catch(console.error);
    }
  }, [tripDays, currentTrip, hasPermission]);

  // Determine what view to show
  useEffect(() => {
    if (userLoading) return;

    if (needsAccount()) {
      setNeedsAccountSetup(true);
    } else if (needsAccountSetup && !needsAccount()) {
      setNeedsAccountSetup(false);
    }
  }, [userLoading, needsAccount, needsAccountSetup]);

  const handleTripSelect = (trip: Trip) => {
    setCurrentTrip(trip);
  };

  const handleTripCreate = (trip: Trip) => {
    // Add user/account information to the trip
    if (appUser && userAccount) {
      const enhancedTrip: Trip = {
        ...trip,
        accountId: userAccount.id,
        createdBy: appUser.clerkId,
        isPublic: false
      };
      setCurrentTrip(enhancedTrip);
    }
  };

  const handleAddDay = (date: Date, park: Park | null) => {
    if (!hasPermission('trips:update')) {
      alert('You do not have permission to modify trips.');
      return;
    }

    const newDay: TripDay = {
      id: `day-${Date.now()}`,
      date: format(date, 'yyyy-MM-dd'),
      park,
      transportation: [],
      rides: [],
      reservations: [],
      food: [],
    };
    
    setTripDays(prev => [...prev, newDay].sort((a, b) => a.date.localeCompare(b.date)));
    setShowAddDayModal(false);
  };

  const handleUpdateDay = (dayId: string, updates: Partial<TripDay>) => {
    if (!hasPermission('trips:update')) {
      alert('You do not have permission to modify trips.');
      return;
    }

    setTripDays(prev => prev.map(day => day.id === dayId ? { ...day, ...updates } : day));
  };

  const handleDeleteDay = (dayId: string) => {
    if (!hasPermission('trips:delete')) {
      alert('You do not have permission to delete trip days.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this day?')) {
      setTripDays(prev => prev.filter(day => day.id !== dayId));
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-disney-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Show account setup if user needs one
  if (needsAccountSetup) {
    return <AccountSetup />;
  }

  // Show admin panel for super admins
  if (showAdmin) {
    return <AdminPanel />;
  }

  return (
    <div className="space-y-6">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Super Admin Impersonation Active
                </p>
                <p className="text-sm text-orange-700">
                  Viewing as: <strong>{impersonatedUser?.name}</strong>
                  {impersonatedAccount && (
                    <span> in account <strong>{impersonatedAccount.name}</strong></span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={stopImpersonation}
              className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              <LogOut size={16} />
              <span>Exit Impersonation</span>
            </button>
          </div>
        </div>
      )}

      {/* Header with navigation */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Disney Trip Planner
          </h1>
          {userAccount && (
            <p className="text-gray-600">
              {userAccount.name} • {appUser?.role || 'Member'}
              {isImpersonating && (
                <span className="text-orange-600 ml-2">
                  (Impersonated View)
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {canAccessAdmin() && (
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <Crown size={16} />
              <span>{showAdmin ? 'Back to Trips' : 'Admin Panel'}</span>
            </button>
          )}
        </div>
      </div>

      {!showAdmin && !needsAccountSetup && (
        <>
          <Header />

          <TripManager
            currentTrip={currentTrip}
            onTripSelect={handleTripSelect}
            onTripCreate={handleTripCreate}
          />

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
                    {hasPermission('trips:create') && (
                      <button
                        onClick={() => setShowAddDayModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Plus size={16} />
                        <span>Add Day</span>
                      </button>
                    )}
                    
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
                    </div>
                  </div>
                </div>

                {/* Trip Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-disney-blue">{tripDays.length}</div>
                    <div className="text-sm text-gray-600">Days</div>
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
                      // canEdit={hasPermission('trips:update')}
                      // canDelete={hasPermission('trips:delete')}
                    />
                  ))}
                  {tripDays.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No days planned yet</h3>
                      <p className="text-gray-600 mb-4">Start planning your magical Disney vacation!</p>
                      {hasPermission('trips:create') && (
                        <button
                          onClick={() => setShowAddDayModal(true)}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Plus size={16} />
                          <span>Add Your First Day</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <AgendaView days={tripDays} />
              )}
            </>
          )}

          {/* Modals */}
          {showAddDayModal && hasPermission('trips:create') && (
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
  );
}

function App() {
  return (
    <AuthWrapper>
      <AppContent />
    </AuthWrapper>
  );
}

export default App; 