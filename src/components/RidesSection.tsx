import React, { useState } from 'react';
import { Plus, Trash2, Edit3, FerrisWheel, Clock, Star, Search, Filter } from 'lucide-react';
import { Ride, RIDE_TYPES, Park } from '../types';
import { ATTRACTIONS, Attraction, ATTRACTION_TYPES, THRILL_LEVELS, ATTRACTION_TAGS } from '../data/attractions';

interface RidesSectionProps {
  rides: Ride[];
  onUpdate: (rides: Ride[]) => void;
  park: Park | null;
}

const RidesSection: React.FC<RidesSectionProps> = ({
  rides,
  onUpdate,
  park,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBrowseAttractions, setShowBrowseAttractions] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterThrillLevel, setFilterThrillLevel] = useState<string>('all');
  const [formData, setFormData] = useState<Partial<Ride>>({
    name: '',
    park: park?.name || '',
    type: 'attraction',
    priority: 'want-to-do',
    timeSlot: '',
    duration: 30,
    fastPass: false,
    geniePlus: false,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRide: Ride = {
      id: editingId || `ride-${Date.now()}`,
      name: formData.name!,
      park: formData.park!,
      type: formData.type!,
      priority: formData.priority!,
      timeSlot: formData.timeSlot || undefined,
      duration: formData.duration!,
      fastPass: formData.fastPass || false,
      geniePlus: formData.geniePlus || false,
      notes: formData.notes || '',
      color: RIDE_TYPES.find(t => t.value === formData.type)?.color || 'disney-gray',
    };

    if (editingId) {
      onUpdate(rides.map(r => r.id === editingId ? newRide : r));
      setEditingId(null);
    } else {
      onUpdate([...rides, newRide]);
    }

    setFormData({
      name: '',
      park: park?.name || '',
      type: 'attraction',
      priority: 'want-to-do',
      timeSlot: '',
      duration: 30,
      fastPass: false,
      geniePlus: false,
      notes: '',
    });
    setShowAddForm(false);
  };

  const handleEdit = (item: Ride) => {
    setEditingId(item.id);
    setFormData(item);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(rides.filter(r => r.id !== id));
  };

  const addAttractionAsRide = (attraction: Attraction) => {
    // Parse duration string to get number (e.g., "3 minutes" -> 3)
    const durationNumber = attraction.duration ? 
      parseInt(attraction.duration.split(' ')[0]) || 5 : 5;
    
    const newRide: Ride = {
      id: `ride-${Date.now()}`,
      name: attraction.name,
      park: attraction.park,
      type: attraction.type === 'thrill-ride' || attraction.type === 'family-ride' ? 'attraction' : 
            attraction.type === 'show' ? 'show' : 
            attraction.type === 'character-meet' ? 'character-meet' : 'attraction',
      priority: 'want-to-do',
      duration: durationNumber,
      fastPass: attraction.lightningLane === 'individual',
      geniePlus: attraction.genieplus,
      notes: attraction.description,
      color: RIDE_TYPES.find(t => t.value === 'attraction')?.color || 'disney-blue',
    };
    onUpdate([...rides, newRide]);
    setShowBrowseAttractions(false);
  };

  const filteredAttractions = ATTRACTIONS.filter(attraction => {
    const matchesSearch = attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attraction.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attraction.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPark = !park || attraction.park === park.name;
    const matchesType = filterType === 'all' || attraction.type === filterType;
    const matchesThrillLevel = filterThrillLevel === 'all' || attraction.thrillLevel === filterThrillLevel;
    
    return matchesSearch && matchesPark && matchesType && matchesThrillLevel;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'must-do': return 'text-red-600';
      case 'want-to-do': return 'text-blue-600';
      case 'if-time': return 'text-yellow-600';
      case 'skip': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'must-do': return 'Must Do';
      case 'want-to-do': return 'Want to Do';
      case 'if-time': return 'If Time';
      case 'skip': return 'Skip';
      default: return priority;
    }
  };

  const getThrillLevelColor = (level: string) => {
    switch (level) {
      case 'mild': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'intense': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-4">
      {rides.length === 0 && !showAddForm && !showBrowseAttractions && (
        <div className="text-center py-4 text-gray-500">
          No rides planned yet
        </div>
      )}

      {/* Rides List */}
      <div className="space-y-3 mb-4">
        {rides.map((ride) => (
          <div
            key={ride.id}
            className="p-3 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FerrisWheel size={16} className="text-disney-green" />
                <div>
                  <div className="font-medium text-gray-800">{ride.name}</div>
                  <div className="text-sm text-gray-600">{ride.park}</div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className={getPriorityColor(ride.priority)}>
                      {getPriorityLabel(ride.priority)}
                    </span>
                    {ride.timeSlot && (
                      <span className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{ride.timeSlot}</span>
                      </span>
                    )}
                    <span>{ride.duration} min</span>
                    {(ride.fastPass || ride.geniePlus) && (
                      <span className="flex items-center space-x-1 text-disney-yellow">
                        <Star size={12} />
                        <span>{ride.fastPass ? 'FastPass' : 'Genie+'}</span>
                      </span>
                    )}
                  </div>
                  {ride.notes && (
                    <div className="text-xs text-gray-500 mt-1">{ride.notes}</div>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(ride)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(ride.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Browse Attractions Modal */}
      {showBrowseAttractions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Browse Attractions</h2>
              <button
                onClick={() => setShowBrowseAttractions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search attractions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                    />
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                >
                  <option value="all">All Types</option>
                  {ATTRACTION_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                <select
                  value={filterThrillLevel}
                  onChange={(e) => setFilterThrillLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                >
                  <option value="all">All Thrill Levels</option>
                  {THRILL_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attractions List */}
            <div className="overflow-y-auto max-h-96 p-4">
              <div className="space-y-3">
                {filteredAttractions.map((attraction) => (
                  <div
                    key={attraction.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-800">{attraction.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getThrillLevelColor(attraction.thrillLevel)}`}>
                            {attraction.thrillLevel}
                          </span>
                          {attraction.genieplus && (
                            <span className="px-2 py-1 text-xs bg-disney-yellow text-white rounded-full">
                              Genie+
                            </span>
                          )}
                          {attraction.lightningLane === 'individual' && (
                            <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full">
                              Individual Lightning Lane
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {attraction.park} • {attraction.location}
                        </div>
                        <div className="text-sm text-gray-700 mb-2">
                          {attraction.description}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{attraction.duration}</span>
                          {attraction.heightRequirement && (
                            <span>Height: {attraction.heightRequirement}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {attraction.accessibility.slice(0, 3).map((access) => (
                            <span
                              key={access}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded"
                            >
                              {access}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => addAttractionAsRide(attraction)}
                        className="ml-4 px-3 py-2 bg-disney-green text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        Add to Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredAttractions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No attractions found matching your criteria
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ride Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                placeholder="e.g., Space Mountain"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Park
              </label>
              <input
                type="text"
                value={formData.park}
                onChange={(e) => setFormData({ ...formData, park: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                placeholder="e.g., Magic Kingdom"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                required
              >
                {RIDE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                required
              >
                <option value="must-do">Must Do</option>
                <option value="want-to-do">Want to Do</option>
                <option value="if-time">If Time</option>
                <option value="skip">Skip</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Slot (Optional)
              </label>
              <input
                type="time"
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                min="5"
                max="180"
                required
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.fastPass}
                    onChange={(e) => setFormData({ ...formData, fastPass: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">FastPass</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.geniePlus}
                    onChange={(e) => setFormData({ ...formData, geniePlus: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Genie+</span>
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-disney-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {editingId ? 'Update' : 'Add'} Ride
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({
                  name: '',
                  park: park?.name || '',
                  type: 'attraction',
                  priority: 'want-to-do',
                  timeSlot: '',
                  duration: 30,
                  fastPass: false,
                  geniePlus: false,
                  notes: '',
                });
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Add Buttons */}
      {!showAddForm && !showBrowseAttractions && (
        <div className="space-y-2">
          <button
            onClick={() => setShowBrowseAttractions(true)}
            className="w-full p-3 border-2 border-dashed border-disney-green rounded-lg text-disney-green hover:bg-disney-green hover:text-white transition-colors flex items-center justify-center space-x-2"
          >
            <Search size={16} />
            <span>Browse Attractions</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-disney-green hover:text-disney-green transition-colors flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Custom Ride</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RidesSection; 