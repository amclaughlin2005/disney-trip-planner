import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Calendar, MapPin } from 'lucide-react';
import { Park, PARKS } from '../types';

interface AddDayModalProps {
  onClose: () => void;
  onAdd: (date: Date, park: Park | null) => void;
  existingDates: Date[];
}

const AddDayModal: React.FC<AddDayModalProps> = ({
  onClose,
  onAdd,
  existingDates,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date(selectedDate + 'T00:00:00');
    onAdd(date, selectedPark);
  };

  const isDateTaken = (dateString: string) => {
    return existingDates.some(existingDate => 
      format(existingDate, 'yyyy-MM-dd') === dateString
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Add Trip Day</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={14} className="sm:w-4 sm:h-4 inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue focus:border-transparent text-base"
              required
            />
            {isDateTaken(selectedDate) && (
              <p className="text-sm text-red-600 mt-1">
                This date is already planned. Please choose a different date.
              </p>
            )}
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={14} className="sm:w-4 sm:h-4 inline mr-2" />
              Park (Optional)
            </label>
            <select
              value={selectedPark?.id || ''}
              onChange={(e) => {
                const park = PARKS.find(p => p.id === e.target.value) || null;
                setSelectedPark(park);
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue focus:border-transparent text-base"
            >
              <option value="">No park selected</option>
              {PARKS.map((park) => (
                <option key={park.id} value={park.id}>
                  {park.icon} {park.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDateTaken(selectedDate)}
              className="flex-1 px-4 py-2.5 bg-disney-blue text-white rounded-lg hover:bg-disney-darkblue transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium min-h-[44px]"
            >
              Add Day
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDayModal; 