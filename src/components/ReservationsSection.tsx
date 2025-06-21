import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Clock, Users } from 'lucide-react';
import { Reservation, RESERVATION_TYPES } from '../types';

interface ReservationsSectionProps {
  reservations: Reservation[];
  onUpdate: (reservations: Reservation[]) => void;
}

const ReservationsSection: React.FC<ReservationsSectionProps> = ({
  reservations,
  onUpdate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Reservation>>({
    name: '',
    type: 'dining',
    location: '',
    date: '',
    time: '',
    partySize: 2,
    confirmationNumber: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReservation: Reservation = {
      id: editingId || `reservation-${Date.now()}`,
      name: formData.name!,
      type: formData.type!,
      location: formData.location!,
      date: formData.date!,
      time: formData.time!,
      partySize: formData.partySize!,
      confirmationNumber: formData.confirmationNumber || '',
      notes: formData.notes || '',
      color: RESERVATION_TYPES.find(t => t.value === formData.type)?.color || 'disney-gray',
    };

    if (editingId) {
      onUpdate(reservations.map(r => r.id === editingId ? newReservation : r));
      setEditingId(null);
    } else {
      onUpdate([...reservations, newReservation]);
    }

    setFormData({
      name: '',
      type: 'dining',
      location: '',
      date: '',
      time: '',
      partySize: 2,
      confirmationNumber: '',
      notes: '',
    });
    setShowAddForm(false);
  };

  const handleEdit = (item: Reservation) => {
    setEditingId(item.id);
    setFormData(item);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(reservations.filter(r => r.id !== id));
  };

  return (
    <div className="p-4">
      {reservations.length === 0 && !showAddForm && (
        <div className="text-center py-4 text-gray-500">
          No reservations planned yet
        </div>
      )}

      {/* Reservations List */}
      <div className="space-y-3 mb-4">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="p-3 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock size={16} className="text-disney-purple" />
                <div>
                  <div className="font-medium text-gray-800">{reservation.name}</div>
                  <div className="text-sm text-gray-600">{reservation.location}</div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="bg-disney-purple text-white px-2 py-1 rounded-full">
                      {RESERVATION_TYPES.find(t => t.value === reservation.type)?.label}
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{reservation.time}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users size={12} />
                      <span>{reservation.partySize} people</span>
                    </span>
                  </div>
                  {reservation.confirmationNumber && (
                    <div className="text-xs text-gray-500 mt-1">
                      Confirmation: {reservation.confirmationNumber}
                    </div>
                  )}
                  {reservation.notes && (
                    <div className="text-xs text-gray-500 mt-1">{reservation.notes}</div>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(reservation)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(reservation.id)}
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
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                placeholder="e.g., Be Our Guest Restaurant"
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
                {RESERVATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                placeholder="e.g., Magic Kingdom"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Size
              </label>
              <input
                type="number"
                value={formData.partySize}
                onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                min="1"
                max="20"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmation Number (Optional)
              </label>
              <input
                type="text"
                value={formData.confirmationNumber}
                onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                placeholder="e.g., ABC123456"
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
              className="px-4 py-2 bg-disney-purple text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              {editingId ? 'Update' : 'Add'} Reservation
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({
                  name: '',
                  type: 'dining',
                  location: '',
                  date: '',
                  time: '',
                  partySize: 2,
                  confirmationNumber: '',
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
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-disney-purple hover:text-disney-purple transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Reservation</span>
        </button>
      )}
    </div>
  );
};

export default ReservationsSection; 