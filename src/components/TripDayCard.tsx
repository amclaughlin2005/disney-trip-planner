import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Car, 
  FerrisWheel, 
  Utensils, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TripDay, Park, PARKS } from '../types';
import TransportationSection from './TransportationSection';
import RidesSection from './RidesSection';
import ReservationsSection from './ReservationsSection';
import FoodSection from './FoodSection';
import AddEventModal from './AddEventModal';

interface TripDayCardProps {
  day: TripDay;
  onUpdate: (updates: Partial<TripDay>) => void;
  onDelete: () => void;
}

const TripDayCard: React.FC<TripDayCardProps> = ({ day, onUpdate, onDelete }) => {
  const [expandedSections, setExpandedSections] = useState({
    transportation: true,
    rides: true,
    reservations: true,
    food: true,
  });
  const [showParkSelector, setShowParkSelector] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [initialEventType, setInitialEventType] = useState<'transportation' | 'dining' | 'attraction'>('attraction');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString: string) => {
    // Parse date string explicitly to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Month is 0-indexed
    return format(date, 'EEEE, MMMM do, yyyy');
  };

  const handleParkSelect = (park: Park) => {
    onUpdate({ park });
    setShowParkSelector(false);
  };

  const handleEditPark = () => {
    setShowParkSelector(true);
  };

  const handleCancelParkSelection = () => {
    setShowParkSelector(false);
  };

  const handleAddEvent = (eventType: 'transportation' | 'dining' | 'attraction' = 'attraction') => {
    setInitialEventType(eventType);
    setShowAddEventModal(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-disney-blue to-disney-purple text-white p-4 sm:p-6">
        <div className="flex items-start sm:items-center justify-between">
          <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
            <Calendar size={20} className="sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-semibold leading-tight">{formatDate(day.date)}</h3>
              {day.park ? (
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm opacity-90 truncate">
                    {day.park.icon} {day.park.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin size={14} className="sm:w-4 sm:h-4 opacity-60 flex-shrink-0" />
                  <button
                    onClick={handleEditPark}
                    className="text-xs sm:text-sm opacity-75 hover:opacity-100 underline transition-opacity bg-white bg-opacity-20 px-2 py-1 rounded"
                  >
                    Select a park
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={() => handleAddEvent()}
              className="p-2 sm:p-2.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Add event"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleEditPark}
              className="p-2 sm:p-2.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Edit park"
            >
              <Edit3 size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 sm:p-2.5 hover:bg-red-500 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Delete day"
            >
              <Trash2 size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Park Selector */}
        {showParkSelector && (
          <div className="mt-4 p-3 sm:p-4 bg-white bg-opacity-10 rounded-lg">
            <h4 className="text-sm font-medium mb-3">Select a park for this day:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {PARKS.map((park) => (
                <button
                  key={park.id}
                  onClick={() => handleParkSelect(park)}
                  className={`p-2 sm:p-3 rounded-lg text-left transition-colors hover:bg-white hover:bg-opacity-20 min-h-[60px] sm:min-h-[70px] ${
                    day.park?.id === park.id ? 'bg-white bg-opacity-20' : ''
                  }`}
                >
                  <div className="text-base sm:text-lg mb-1">{park.icon}</div>
                  <div className="text-xs font-medium leading-tight">{park.name}</div>
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-3">
              <button
                onClick={handleCancelParkSelection}
                className="px-3 py-2 text-xs sm:text-sm bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              {day.park && (
                <button
                  onClick={() => {
                    onUpdate({ park: null });
                    setShowParkSelector(false);
                  }}
                  className="px-3 py-2 text-xs sm:text-sm bg-red-500 bg-opacity-70 rounded hover:bg-opacity-90 transition-colors min-h-[44px]"
                >
                  Remove Park
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Day Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Transportation Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('transportation')}
            className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors min-h-[56px]"
          >
            <div className="flex items-center space-x-3">
              <Car size={18} className="sm:w-5 sm:h-5 text-disney-blue flex-shrink-0" />
              <span className="font-semibold text-gray-800 text-sm sm:text-base">Transportation</span>
              <span className="bg-disney-blue text-white text-xs px-2 py-1 rounded-full">
                {day.transportation.length}
              </span>
            </div>
            {expandedSections.transportation ? <ChevronUp size={18} className="sm:w-5 sm:h-5" /> : <ChevronDown size={18} className="sm:w-5 sm:h-5" />}
          </button>
          {expandedSections.transportation && (
            <div>
              {day.transportation.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="mb-2 text-sm sm:text-base">No transportation planned</p>
                  <button
                    onClick={() => handleAddEvent('transportation')}
                    className="text-disney-blue hover:text-blue-600 text-sm font-medium min-h-[44px] px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    + Add Transportation
                  </button>
                </div>
              ) : (
                <TransportationSection
                  transportation={day.transportation}
                  onUpdate={(transportation: any) => onUpdate({ transportation })}
                />
              )}
            </div>
          )}
        </div>

        {/* Rides Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('rides')}
            className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors min-h-[56px]"
          >
            <div className="flex items-center space-x-3">
              <FerrisWheel size={18} className="sm:w-5 sm:h-5 text-disney-green flex-shrink-0" />
              <span className="font-semibold text-gray-800 text-sm sm:text-base">Rides & Attractions</span>
              <span className="bg-disney-green text-white text-xs px-2 py-1 rounded-full">
                {day.rides.length}
              </span>
            </div>
            {expandedSections.rides ? <ChevronUp size={18} className="sm:w-5 sm:h-5" /> : <ChevronDown size={18} className="sm:w-5 sm:h-5" />}
          </button>
          {expandedSections.rides && (
            <div>
              {day.rides.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="mb-2 text-sm sm:text-base">No rides planned</p>
                  <button
                    onClick={() => handleAddEvent('attraction')}
                    className="text-disney-green hover:text-green-600 text-sm font-medium min-h-[44px] px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    + Add Attraction
                  </button>
                </div>
              ) : (
                <RidesSection
                  rides={day.rides}
                  onUpdate={(rides: any) => onUpdate({ rides })}
                  park={day.park}
                />
              )}
            </div>
          )}
        </div>

        {/* Reservations Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('reservations')}
            className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors min-h-[56px]"
          >
            <div className="flex items-center space-x-3">
              <Clock size={18} className="sm:w-5 sm:h-5 text-disney-purple flex-shrink-0" />
              <span className="font-semibold text-gray-800 text-sm sm:text-base">Reservations</span>
              <span className="bg-disney-purple text-white text-xs px-2 py-1 rounded-full">
                {day.reservations.length}
              </span>
            </div>
            {expandedSections.reservations ? <ChevronUp size={18} className="sm:w-5 sm:h-5" /> : <ChevronDown size={18} className="sm:w-5 sm:h-5" />}
          </button>
          {expandedSections.reservations && (
            <div>
              {day.reservations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="mb-2 text-sm sm:text-base">No reservations planned</p>
                  <button
                    onClick={() => handleAddEvent('dining')}
                    className="text-disney-purple hover:text-purple-600 text-sm font-medium min-h-[44px] px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    + Add Reservation
                  </button>
                </div>
              ) : (
                <ReservationsSection
                  reservations={day.reservations}
                  onUpdate={(reservations: any) => onUpdate({ reservations })}
                />
              )}
            </div>
          )}
        </div>

        {/* Food Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('food')}
            className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors min-h-[56px]"
          >
            <div className="flex items-center space-x-3">
              <Utensils size={18} className="sm:w-5 sm:h-5 text-disney-orange flex-shrink-0" />
              <span className="font-semibold text-gray-800 text-sm sm:text-base">Food & Dining</span>
              <span className="bg-disney-orange text-white text-xs px-2 py-1 rounded-full">
                {day.food.length}
              </span>
            </div>
            {expandedSections.food ? <ChevronUp size={18} className="sm:w-5 sm:h-5" /> : <ChevronDown size={18} className="sm:w-5 sm:h-5" />}
          </button>
          {expandedSections.food && (
            <div>
              {day.food.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="mb-2 text-sm sm:text-base">No food plans</p>
                  <button
                    onClick={() => handleAddEvent('dining')}
                    className="text-disney-orange hover:text-orange-600 text-sm font-medium min-h-[44px] px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    + Add Food Plan
                  </button>
                </div>
              ) : (
                <FoodSection
                  food={day.food}
                  onUpdate={(food: any) => onUpdate({ food })}
                  park={day.park}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <AddEventModal
          isOpen={showAddEventModal}
          onClose={() => setShowAddEventModal(false)}
          day={day}
          onAddEvent={onUpdate}
          initialEventType={initialEventType}
        />
      )}
    </div>
  );
};

export default TripDayCard; 