import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Utensils, Clock, DollarSign, Search } from 'lucide-react';
import { Food, FOOD_TYPES, Park } from '../types';
import { DINING_LOCATIONS, DiningLocation, CUISINE_TYPES, MEAL_TYPES, DINING_PLAN_TYPES } from '../data/dining';

interface FoodSectionProps {
  food: Food[];
  onUpdate: (food: Food[]) => void;
  park: Park | null;
}

const FoodSection: React.FC<FoodSectionProps> = ({
  food,
  onUpdate,
  park,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBrowseDining, setShowBrowseDining] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCuisine, setFilterCuisine] = useState<string>('all');
  const [filterMealType, setFilterMealType] = useState<string>('all');
  const [filterDiningPlan, setFilterDiningPlan] = useState<string>('all');
  const [formData, setFormData] = useState<Partial<Food>>({
    name: '',
    location: park?.name || '',
    type: 'quick-service',
    mealType: 'lunch',
    timeSlot: '',
    partySize: 2,
    budget: 50,
    reservationNumber: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFood: Food = {
      id: editingId || `food-${Date.now()}`,
      name: formData.name!,
      location: formData.location!,
      type: formData.type!,
      mealType: formData.mealType!,
      timeSlot: formData.timeSlot || undefined,
      partySize: formData.partySize!,
      budget: formData.budget!,
      reservationNumber: formData.reservationNumber || undefined,
      notes: formData.notes || '',
      color: FOOD_TYPES.find(t => t.value === formData.type)?.color || 'disney-orange',
    };

    if (editingId) {
      onUpdate(food.map(f => f.id === editingId ? newFood : f));
      setEditingId(null);
    } else {
      onUpdate([...food, newFood]);
    }

    setFormData({
      name: '',
      location: park?.name || '',
      type: 'quick-service',
      mealType: 'lunch',
      timeSlot: '',
      partySize: 2,
      budget: 50,
      reservationNumber: '',
      notes: '',
    });
    setShowAddForm(false);
  };

  const handleEdit = (item: Food) => {
    setEditingId(item.id);
    setFormData(item);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(food.filter(f => f.id !== id));
  };

  const addDiningLocationAsFood = (dining: DiningLocation) => {
    const estimatedBudget = dining.priceRange === '$' ? 25 : 
                           dining.priceRange === '$$' ? 50 : 
                           dining.priceRange === '$$$' ? 100 : 150;

    const newFood: Food = {
      id: `food-${Date.now()}`,
      name: dining.name,
      location: `${dining.park} - ${dining.location}`,
      type: dining.diningPlanType.includes('Quick/Counter Service') ? 'quick-service' : 
            dining.diningPlanType.includes('Table Service') ? 'table-service' : 
            dining.diningPlanType.includes('Character Dining') ? 'character-dining' : 'quick-service',
      mealType: dining.mealTypes[0]?.toLowerCase() as any || 'lunch',
      partySize: 2,
      budget: estimatedBudget,
      reservationNumber: dining.reservationRequired ? 'NEEDED' : undefined,
      notes: `${dining.cuisine.join(', ')} • ${dining.description}`,
      color: FOOD_TYPES.find(t => t.value === 'quick-service')?.color || 'disney-orange',
    };
    onUpdate([...food, newFood]);
    setShowBrowseDining(false);
  };

  const filteredDining = DINING_LOCATIONS.filter(dining => {
    const matchesSearch = dining.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dining.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dining.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPark = !park || dining.park === park.name;
    const matchesCuisine = filterCuisine === 'all' || dining.cuisine.includes(filterCuisine);
    const matchesMealType = filterMealType === 'all' || dining.mealTypes.some(m => m.toLowerCase() === filterMealType.toLowerCase());
    const matchesDiningPlan = filterDiningPlan === 'all' || dining.diningPlanType.includes(filterDiningPlan);
    
    return matchesSearch && matchesPark && matchesCuisine && matchesMealType && matchesDiningPlan;
  });

  const getPriceRangeText = (priceRange: string) => {
    switch (priceRange) {
      case '$': return 'Budget-friendly';
      case '$$': return 'Moderate';
      case '$$$': return 'Expensive';
      case '$$$$': return 'Very Expensive';
      default: return 'Unknown';
    }
  };

  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange) {
      case '$': return 'text-green-600 bg-green-100';
      case '$$': return 'text-yellow-600 bg-yellow-100';
      case '$$$': return 'text-orange-600 bg-orange-100';
      case '$$$$': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalBudget = food.reduce((sum, item) => sum + item.budget, 0);

  return (
    <div className="p-4">
      {food.length === 0 && !showAddForm && !showBrowseDining && (
        <div className="text-center py-4 text-gray-500">
          No dining planned yet
        </div>
      )}

      {/* Budget Summary */}
      {food.length > 0 && (
        <div className="mb-4 p-3 bg-disney-orange bg-opacity-10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Food Budget</span>
            <span className="text-lg font-bold text-disney-orange">${totalBudget}</span>
          </div>
        </div>
      )}

      {/* Food List */}
      <div className="space-y-3 mb-4">
        {food.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Utensils size={16} className="text-disney-orange" />
                <div>
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.location}</div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="capitalize">{item.type.replace('-', ' ')}</span>
                    <span className="capitalize">{item.mealType}</span>
                    {item.timeSlot && (
                      <span className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{item.timeSlot}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <DollarSign size={12} />
                      <span>${item.budget}</span>
                    </span>
                    <span>{item.partySize} people</span>
                  </div>
                  {item.reservationNumber && (
                    <div className="text-xs text-disney-blue mt-1">
                      Reservation: {item.reservationNumber}
                    </div>
                  )}
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

      {/* Browse Dining Modal */}
      {showBrowseDining && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Browse Dining Locations</h2>
              <button
                onClick={() => setShowBrowseDining(false)}
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
                      placeholder="Search restaurants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                    />
                  </div>
                </div>
                <select
                  value={filterCuisine}
                  onChange={(e) => setFilterCuisine(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                >
                  <option value="all">All Cuisines</option>
                  {CUISINE_TYPES.map(cuisine => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
                <select
                  value={filterMealType}
                  onChange={(e) => setFilterMealType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                >
                  <option value="all">All Meals</option>
                  {MEAL_TYPES.map(meal => (
                    <option key={meal} value={meal}>
                      {meal}
                    </option>
                  ))}
                </select>
                <select
                  value={filterDiningPlan}
                  onChange={(e) => setFilterDiningPlan(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                >
                  <option value="all">All Service Types</option>
                  {DINING_PLAN_TYPES.map(plan => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dining List */}
            <div className="overflow-y-auto max-h-96 p-4">
              <div className="space-y-3">
                {filteredDining.map((dining) => (
                  <div
                    key={dining.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-800">{dining.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriceRangeColor(dining.priceRange)}`}>
                            {dining.priceRange} - {getPriceRangeText(dining.priceRange)}
                          </span>
                          {dining.reservationRequired && (
                            <span className="px-2 py-1 text-xs bg-disney-blue text-white rounded-full">
                              Reservations Required
                            </span>
                          )}
                          {dining.mobileOrder && (
                            <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                              Mobile Order
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {dining.park} • {dining.location}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                          <span>Cuisine: {dining.cuisine.slice(0, 3).join(', ')}</span>
                          <span>Meals: {dining.mealTypes.join(', ')}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {dining.diningPlanType.map((plan) => (
                            <span
                              key={plan}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded"
                            >
                              {plan}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {dining.description}
                        </div>
                        {dining.dietaryOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dining.dietaryOptions.map((diet) => (
                              <span
                                key={diet}
                                className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded"
                              >
                                {diet}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => addDiningLocationAsFood(dining)}
                        className="ml-4 px-3 py-2 bg-disney-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                      >
                        Add to Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
                             {filteredDining.length === 0 && (
                 <div className="text-center py-8 text-gray-500">
                   No dining locations found matching your criteria
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
                Restaurant Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                placeholder="e.g., Be Our Guest"
                required
              />
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
                placeholder="e.g., Magic Kingdom - Fantasyland"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                required
              >
                {FOOD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Type
              </label>
              <select
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                required
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget ($)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reservation Number (Optional)
              </label>
              <input
                type="text"
                value={formData.reservationNumber}
                onChange={(e) => setFormData({ ...formData, reservationNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                placeholder="Confirmation number"
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
                placeholder="Dietary restrictions, preferences, etc."
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-disney-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {editingId ? 'Update' : 'Add'} Dining
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({
                  name: '',
                  location: park?.name || '',
                  type: 'quick-service',
                  mealType: 'lunch',
                  timeSlot: '',
                  partySize: 2,
                  budget: 50,
                  reservationNumber: '',
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
      {!showAddForm && !showBrowseDining && (
        <div className="space-y-2">
          <button
            onClick={() => setShowBrowseDining(true)}
            className="w-full p-3 border-2 border-dashed border-disney-orange rounded-lg text-disney-orange hover:bg-disney-orange hover:text-white transition-colors flex items-center justify-center space-x-2"
          >
            <Search size={16} />
            <span>Browse Dining Locations</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-disney-orange hover:text-disney-orange transition-colors flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Custom Dining</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodSection; 