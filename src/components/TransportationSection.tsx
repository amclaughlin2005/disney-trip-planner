import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Car, Clock } from 'lucide-react';
import { Transportation, TRANSPORTATION_TYPES } from '../types';

interface TransportationSectionProps {
  transportation: Transportation[];
  onUpdate: (transportation: Transportation[]) => void;
}

const TransportationSection: React.FC<TransportationSectionProps> = ({
  transportation,
  onUpdate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Transportation>>({
    type: 'bus',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransportation: Transportation = {
      id: editingId || `transport-${Date.now()}`,
      type: formData.type!,
      from: formData.from!,
      to: formData.to!,
      departureTime: formData.departureTime!,
      arrivalTime: formData.arrivalTime!,
      notes: formData.notes || '',
      color: TRANSPORTATION_TYPES.find(t => t.value === formData.type)?.color || 'disney-gray',
    };

    if (editingId) {
      onUpdate(transportation.map(t => t.id === editingId ? newTransportation : t));
      setEditingId(null);
    } else {
      onUpdate([...transportation, newTransportation]);
    }

    setFormData({
      type: 'bus',
      from: '',
      to: '',
      departureTime: '',
      arrivalTime: '',
      notes: '',
    });
    setShowAddForm(false);
  };

  const handleEdit = (item: Transportation) => {
    setEditingId(item.id);
    setFormData(item);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(transportation.filter(t => t.id !== id));
  };

  const getTypeColor = (type: string) => {
    return TRANSPORTATION_TYPES.find(t => t.value === type)?.color || 'disney-gray';
  };

  return (
    <div className="p-4">
      {transportation.length === 0 && !showAddForm && (
        <div className="text-center py-4 text-gray-500">
          No transportation planned yet
        </div>
      )}

      {/* Transportation List */}
      <div className="space-y-3 mb-4">
        {transportation.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border-l-4 bg-${getTypeColor(item.type)}-50 border-${getTypeColor(item.type)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Car size={16} className={`text-${getTypeColor(item.type)}`} />
                <div>
                  <div className="font-medium text-gray-800">
                    {TRANSPORTATION_TYPES.find(t => t.value === item.type)?.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.from} → {item.to}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-2">
                    <Clock size={12} />
                    <span>{item.departureTime} - {item.arrivalTime}</span>
                  </div>
                  {item.notes && (
                    <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                {TRANSPORTATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="text"
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                placeholder="e.g., Hotel, Park, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="text"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                placeholder="e.g., Park, Restaurant, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departure Time
              </label>
              <input
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                required
              />
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
                required
              />
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
              className="px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-disney-darkblue transition-colors"
            >
              {editingId ? 'Update' : 'Add'} Transportation
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({
                  type: 'bus',
                  from: '',
                  to: '',
                  departureTime: '',
                  arrivalTime: '',
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

      {/* Add Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-disney-blue hover:text-disney-blue transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Transportation</span>
        </button>
      )}
    </div>
  );
};

export default TransportationSection; 