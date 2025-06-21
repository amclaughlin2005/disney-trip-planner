import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Plus, List, Grid, Bot } from 'lucide-react';
import { Trip, TripDay, Park } from './types';
import { storageService } from './utils/cloudStorage';
import TripDayCard from './components/TripDayCard';
import AddDayModal from './components/AddDayModal';
import Header from './components/Header';
import AgendaView from './components/AgendaView';
import TripManager from './components/TripManager';
import AIAssistant from './components/AIAssistant';

function App() {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [tripDays, setTripDays] = useState<TripDay[]>([]);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const [viewMode, setViewMode] = useState<'detailed' | 'agenda'>('detailed');

  // Update trip days when current trip changes
  useEffect(() => {
    if (currentTrip) {
      setTripDays(currentTrip.days);
    } else {
      setTripDays([]);
    }
  }, [currentTrip]);

  // Save trip data whenever trip days change (but not when currentTrip changes)
  useEffect(() => {
    if (currentTrip && tripDays.length > 0) {
      const updatedTrip = {
        ...currentTrip,
        days: tripDays,
      };
      storageService.saveTrip(updatedTrip).catch(console.error);
    }
  }, [tripDays]); // Only depend on tripDays, not currentTrip

  const handleTripSelect = (trip: Trip) => {
    setCurrentTrip(trip);
  };

  const handleTripCreate = (trip: Trip) => {
    setCurrentTrip(trip);
  };

  const addDay = (date: Date, park: Park | null) => {
    if (!currentTrip) {
      alert('Please create or select a trip first');
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

  const updateDay = (dayId: string, updates: Partial<TripDay>) => {
    setTripDays(prev => prev.map(day => 
      day.id === dayId ? { ...day, ...updates } : day
    ));
  };

  const deleteDay = (dayId: string) => {
    setTripDays(prev => prev.filter(day => day.id !== dayId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-disney-blue to-disney-purple">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Trip Management */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <TripManager
            currentTrip={currentTrip}
            onTripSelect={handleTripSelect}
            onTripCreate={handleTripCreate}
          />
        </div>

        {/* Trip Summary */}
        {currentTrip && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Trip Overview</h2>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors text-sm ${
                      viewMode === 'detailed' 
                        ? 'bg-white text-disney-blue shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Grid size={16} />
                    <span>Detailed</span>
                  </button>
                  <button
                    onClick={() => setViewMode('agenda')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors text-sm ${
                      viewMode === 'agenda' 
                        ? 'bg-white text-disney-blue shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <List size={16} />
                    <span>Agenda</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setShowAIAssistant(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-all text-sm font-medium min-h-[44px] shadow-md hover:shadow-lg"
                  >
                    <Bot size={18} />
                    <span>AI Assistant</span>
                  </button>
                  <button
                    onClick={() => setShowAddDayModal(true)}
                    className="bg-disney-blue hover:bg-disney-darkblue text-white px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm font-medium min-h-[44px]"
                  >
                    <Plus size={18} />
                    <span>Add Day</span>
                  </button>
                </div>
              </div>
            </div>
          
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 text-sm sm:text-base">Total Days</h3>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{tripDays.length}</p>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 text-sm sm:text-base">Rides Planned</h3>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {tripDays.reduce((total, day) => total + day.rides.length, 0)}
                </p>
              </div>
              <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 text-sm sm:text-base">Reservations</h3>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {tripDays.reduce((total, day) => total + day.reservations.length, 0)}
                </p>
              </div>
              <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800 text-sm sm:text-base">Food Plans</h3>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  {tripDays.reduce((total, day) => total + day.food.length, 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trip Content */}
        {!currentTrip ? (
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
            <Calendar size={64} className="sm:w-20 sm:h-20 mx-auto text-disney-blue mb-6" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">No trip selected</h3>
            <p className="text-gray-600 mb-6 px-4 text-base sm:text-lg max-w-md mx-auto">Create a new trip or load an existing one to start planning your magical Disney vacation!</p>
          </div>
        ) : tripDays.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
            <Calendar size={64} className="sm:w-20 sm:h-20 mx-auto text-disney-blue mb-6" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">No trip days planned yet</h3>
            <p className="text-gray-600 mb-6 px-4 text-base sm:text-lg max-w-md mx-auto">Start by adding your first day to begin planning your magical Disney vacation!</p>
            <button
              onClick={() => setShowAddDayModal(true)}
              className="bg-disney-blue hover:bg-disney-darkblue text-white px-8 py-4 rounded-lg flex items-center space-x-3 mx-auto transition-colors text-lg font-medium shadow-md hover:shadow-lg min-h-[52px]"
            >
              <Plus size={24} />
              <span>Add Your First Day</span>
            </button>
          </div>
        ) : viewMode === 'agenda' ? (
          <AgendaView days={tripDays} />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {tripDays.map((day) => (
              <TripDayCard
                key={day.id}
                day={day}
                onUpdate={(updates: Partial<TripDay>) => updateDay(day.id, updates)}
                onDelete={() => deleteDay(day.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Day Modal */}
      {showAddDayModal && (
        <AddDayModal
          onAdd={addDay}
          onClose={() => setShowAddDayModal(false)}
          existingDates={tripDays.map(day => new Date(day.date + 'T00:00:00'))}
        />
      )}

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <AIAssistant
          currentTrip={currentTrip}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  );
}

export default App; 