import React, { useState, useEffect } from 'react';
import { X, Car, Utensils, FerrisWheel, Clock, MapPin, Users, DollarSign, Zap } from 'lucide-react';
import { TripDay, Park, Transportation, Ride, Food, TRANSPORTATION_TYPES, FOOD_TYPES } from '../types';
import { DINING_LOCATIONS } from '../data/dining';
import { ATTRACTIONS } from '../data/attractions';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: TripDay;
  onAddEvent: (updates: Partial<TripDay>) => void;
  initialEventType?: EventType;
}

type EventType = 'transportation' | 'dining' | 'attraction';

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  day,
  onAddEvent,
  initialEventType = 'attraction',
}) => {
  const [eventType, setEventType] = useState<EventType>(initialEventType);
  const [formData, setFormData] = useState({
    // Common fields
    time: '',
    
    // Transportation fields
    transportationType: 'bus',
    from: '',
    to: '',
    arrivalTime: '',
    transportationNotes: '',
    
    // Dining fields
    diningLocation: '',
    mealType: 'lunch',
    partySize: 2,
    budget: 50,
    reservationNumber: '',
    diningNotes: '',
    
    // Attraction fields
    attraction: '',
    priority: 'want-to-do',
    hasLightningLane: false,
    attractionNotes: '',
  });

  useEffect(() => {
    if (isOpen) {
      // Set initial event type when modal opens
      setEventType(initialEventType);
    } else {
      // Reset form when modal closes
      setFormData({
        time: '',
        transportationType: 'bus',
        from: '',
        to: '',
        arrivalTime: '',
        transportationNotes: '',
        diningLocation: '',
        mealType: 'lunch',
        partySize: 2,
        budget: 50,
        reservationNumber: '',
        diningNotes: '',
        attraction: '',
        priority: 'want-to-do',
        hasLightningLane: false,
        attractionNotes: '',
      });
    }
  }, [isOpen, initialEventType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (eventType === 'transportation') {
      if (!formData.from || !formData.to || !formData.time) {
        alert('Please fill in all required transportation fields');
        return;
      }
      
      const newTransportation: Transportation = {
        id: `transport-${Date.now()}`,
        type: formData.transportationType as any,
        from: formData.from,
        to: formData.to,
        departureTime: formData.time,
        arrivalTime: formData.arrivalTime,
        notes: formData.transportationNotes,
        color: TRANSPORTATION_TYPES.find(t => t.value === formData.transportationType)?.color || 'disney-blue',
      };
      
      onAddEvent({
        transportation: [...day.transportation, newTransportation]
      });
      
    } else if (eventType === 'dining') {
      if (!formData.diningLocation || !formData.time) {
        alert('Please fill in all required dining fields');
        return;
      }
      
      const selectedDining = DINING_LOCATIONS.find(d => d.id === formData.diningLocation);
      
      // Determine food type based on dining plan type
      let foodType: 'quick-service' | 'table-service' | 'character-dining' | 'snack' | 'drink' | 'dessert' = 'quick-service';
      if (selectedDining?.diningPlanType?.includes('Table Service')) {
        foodType = 'table-service';
      } else if (selectedDining?.diningPlanType?.includes('Character Dining')) {
        foodType = 'character-dining';
      } else if (selectedDining?.mealTypes?.includes('Snacks')) {
        foodType = 'snack';
      }

      const newFood: Food = {
        id: `food-${Date.now()}`,
        name: selectedDining?.name || formData.diningLocation,
        type: foodType,
        location: selectedDining?.location || '',
        mealType: formData.mealType as any,
        timeSlot: formData.time,
        partySize: formData.partySize,
        budget: formData.budget,
        reservationNumber: formData.reservationNumber,
        notes: formData.diningNotes,
        color: FOOD_TYPES.find(f => f.value === foodType)?.color || 'disney-orange',
      };
      
      onAddEvent({
        food: [...day.food, newFood]
      });
      
    } else if (eventType === 'attraction') {
      if (!formData.attraction || !formData.time) {
        alert('Please fill in all required attraction fields');
        return;
      }
      
      const selectedAttraction = ATTRACTIONS.find(a => a.id === formData.attraction);
      
      // Map attraction type to ride type
      let rideType: 'attraction' | 'show' | 'character-meet' | 'parade' | 'fireworks' = 'attraction';
      if (selectedAttraction?.type === 'show') {
        rideType = 'show';
      } else if (selectedAttraction?.type === 'character-meet') {
        rideType = 'character-meet';
      }
      
      const newRide: Ride = {
        id: `ride-${Date.now()}`,
        name: selectedAttraction?.name || formData.attraction,
        park: selectedAttraction?.park || day.park?.name || '',
        type: rideType,
        priority: formData.priority as any,
        timeSlot: formData.time,
        duration: selectedAttraction?.duration ? parseInt(selectedAttraction.duration) : 30,
        fastPass: false,
        geniePlus: formData.hasLightningLane,
        notes: formData.attractionNotes,
        color: 'disney-green',
      };
      
      onAddEvent({
        rides: [...day.rides, newRide]
      });
    }
    
    onClose();
  };

  const getFilteredAttractions = () => {
    if (!day.park) return ATTRACTIONS;
    return ATTRACTIONS.filter(attraction => attraction.park === day.park!.name);
  };

  const getFilteredDining = () => {
    if (!day.park) return DINING_LOCATIONS;
    return DINING_LOCATIONS.filter(dining => dining.park === day.park!.name);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Event Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setEventType('transportation')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  eventType === 'transportation'
                    ? 'border-disney-blue bg-disney-blue bg-opacity-10 text-disney-blue'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Car size={24} className="mx-auto mb-2" />
                <div className="text-sm font-medium">Transportation</div>
              </button>
              
              <button
                type="button"
                onClick={() => setEventType('dining')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  eventType === 'dining'
                    ? 'border-disney-orange bg-disney-orange bg-opacity-10 text-disney-orange'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Utensils size={24} className="mx-auto mb-2" />
                <div className="text-sm font-medium">Dining</div>
              </button>
              
              <button
                type="button"
                onClick={() => setEventType('attraction')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  eventType === 'attraction'
                    ? 'border-disney-green bg-disney-green bg-opacity-10 text-disney-green'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FerrisWheel size={24} className="mx-auto mb-2" />
                <div className="text-sm font-medium">Attraction</div>
              </button>
            </div>
          </div>

          {/* Time Field (Common) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock size={16} className="inline mr-1" />
              Time *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
              required
            />
          </div>

          {/* Transportation Fields */}
          {eventType === 'transportation' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transportation Type *
                </label>
                <select
                  value={formData.transportationType}
                  onChange={(e) => setFormData({ ...formData, transportationType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                  required
                >
                  {TRANSPORTATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From *
                  </label>
                  <input
                    type="text"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                    placeholder="Starting location"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To *
                  </label>
                  <input
                    type="text"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                    placeholder="Destination"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Time
                </label>
                <input
                  type="time"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.transportationNotes}
                  onChange={(e) => setFormData({ ...formData, transportationNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </>
          )}

          {/* Dining Fields */}
          {eventType === 'dining' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin size={16} className="inline mr-1" />
                  Dining Location *
                </label>
                <select
                  value={formData.diningLocation}
                  onChange={(e) => setFormData({ ...formData, diningLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                  required
                >
                  <option value="">Select a restaurant...</option>
                  {getFilteredDining().map((dining) => (
                    <option key={dining.id} value={dining.id}>
                      {dining.name} - {dining.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meal Type
                  </label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users size={16} className="inline mr-1" />
                    Party Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.partySize}
                    onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign size={16} className="inline mr-1" />
                    Budget
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reservation #
                  </label>
                  <input
                    type="text"
                    value={formData.reservationNumber}
                    onChange={(e) => setFormData({ ...formData, reservationNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.diningNotes}
                  onChange={(e) => setFormData({ ...formData, diningNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                  rows={2}
                  placeholder="Special requests, dietary restrictions, etc."
                />
              </div>
            </>
          )}

          {/* Attraction Fields */}
          {eventType === 'attraction' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FerrisWheel size={16} className="inline mr-1" />
                  Attraction *
                </label>
                <select
                  value={formData.attraction}
                  onChange={(e) => setFormData({ ...formData, attraction: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                  required
                >
                  <option value="">Select an attraction...</option>
                  {getFilteredAttractions().map((attraction) => (
                    <option key={attraction.id} value={attraction.id}>
                      {attraction.name} - {attraction.park}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                  >
                    <option value="must-do">Must Do</option>
                    <option value="want-to-do">Want to Do</option>
                    <option value="if-time">If Time</option>
                    <option value="skip">Skip</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasLightningLane}
                      onChange={(e) => setFormData({ ...formData, hasLightningLane: e.target.checked })}
                      className="w-4 h-4 text-disney-yellow bg-gray-100 border-gray-300 rounded focus:ring-disney-yellow"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <Zap size={16} className="mr-1 text-disney-yellow" />
                      Lightning Lane
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.attractionNotes}
                  onChange={(e) => setFormData({ ...formData, attractionNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                  rows={2}
                  placeholder="Height requirements, strategy notes, etc."
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Add Event
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal; 