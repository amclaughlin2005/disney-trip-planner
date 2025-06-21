import React from 'react';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Car, 
  FerrisWheel, 
  Utensils, 
  Clock,
  Star,
  DollarSign,
  Users
} from 'lucide-react';
import { TripDay } from '../types';

interface AgendaViewProps {
  days: TripDay[];
}

const AgendaView: React.FC<AgendaViewProps> = ({ days }) => {
  const formatDate = (dateString: string) => {
    // Parse date string explicitly to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Month is 0-indexed
    return format(date, 'EEE, MMM d');
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
  };

  const sortByTime = (items: any[]) => {
    return [...items].sort((a, b) => {
      const timeA = a.timeSlot || a.departureTime || a.time || '23:59';
      const timeB = b.timeSlot || b.departureTime || b.time || '23:59';
      return timeA.localeCompare(timeB);
    });
  };

  const getAllActivities = (day: TripDay) => {
    const activities = [
      ...day.transportation.map(t => ({ ...t, type: 'transportation', icon: Car, color: 'disney-blue' })),
      ...day.rides.map(r => ({ ...r, type: 'ride', icon: FerrisWheel, color: 'disney-green' })),
      ...day.reservations.map(r => ({ ...r, type: 'reservation', icon: Clock, color: 'disney-purple' })),
      ...day.food.map(f => ({ ...f, type: 'food', icon: Utensils, color: 'disney-orange' }))
    ];
    return sortByTime(activities);
  };

  const getTimeForActivity = (activity: any) => {
    return activity.timeSlot || activity.departureTime || activity.time || '';
  };

  const totalBudget = days.reduce((total, day) => {
    return total + day.food.reduce((dayTotal, food) => dayTotal + food.budget, 0);
  }, 0);

  const totalActivities = days.reduce((total, day) => {
    return total + day.transportation.length + day.rides.length + day.reservations.length + day.food.length;
  }, 0);

  if (days.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500">
        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm sm:text-base">No trip days planned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Trip Summary */}
      <div className="bg-gradient-to-r from-disney-blue to-disney-purple text-white rounded-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Trip Overview</h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold">{days.length}</div>
            <div className="text-xs sm:text-sm opacity-90">Days Planned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold">{totalActivities}</div>
            <div className="text-xs sm:text-sm opacity-90">Total Activities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold">${totalBudget}</div>
            <div className="text-xs sm:text-sm opacity-90">Food Budget</div>
          </div>
        </div>
      </div>

      {/* Daily Timeline */}
      <div className="space-y-3 sm:space-y-4">
        {days.map((day) => {
          const activities = getAllActivities(day);
          
          return (
            <div key={day.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Day Header */}
              <div className="bg-gray-50 border-b p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <Calendar size={18} className="sm:w-5 sm:h-5 text-disney-blue flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{formatDate(day.date)}</h3>
                      {day.park ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-600 truncate">
                            {day.park.icon} {day.park.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-400 italic">
                            No park selected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Car size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span>{day.transportation.length}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FerrisWheel size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span>{day.rides.length}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span>{day.reservations.length}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Utensils size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span>{day.food.length}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Activities Timeline */}
              <div className="p-3 sm:p-4">
                {activities.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <p className="text-sm sm:text-base">No activities planned for this day</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activities.map((activity, index) => {
                      const Icon = activity.icon;
                      const time = getTimeForActivity(activity);
                      
                      return (
                        <div
                          key={`${activity.type}-${activity.id}`}
                          className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {/* Time */}
                          <div className="w-16 sm:w-20 text-xs sm:text-sm font-medium text-gray-600 flex-shrink-0 pt-1">
                            {time ? formatTime(time) : 'TBD'}
                          </div>

                          {/* Icon */}
                          <div className={`p-1.5 sm:p-2 rounded-full bg-${activity.color} bg-opacity-10 flex-shrink-0`}>
                            <Icon size={14} className={`sm:w-4 sm:h-4 text-${activity.color}`} />
                          </div>

                          {/* Activity Details */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 text-sm sm:text-base truncate">{activity.name}</div>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-1">
                              {activity.type === 'transportation' && (
                                <>
                                  <span className="truncate">{activity.from} → {activity.to}</span>
                                  {activity.arrivalTime && (
                                    <span className="hidden sm:inline">Arrives: {formatTime(activity.arrivalTime)}</span>
                                  )}
                                </>
                              )}
                              {activity.type === 'ride' && (
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                                  <span className="truncate">{activity.park}</span>
                                  <div className="flex items-center space-x-2 sm:space-x-4">
                                    <span className="capitalize text-xs">{activity.priority?.replace('-', ' ')}</span>
                                    <span className="text-xs">{activity.duration} min</span>
                                    {(activity.fastPass || activity.geniePlus) && (
                                      <span className="flex items-center space-x-1 text-disney-yellow">
                                        <Star size={10} className="sm:w-3 sm:h-3" />
                                        <span className="text-xs">{activity.fastPass ? 'FastPass' : 'Genie+'}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              {activity.type === 'reservation' && (
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                                  <span className="truncate">{activity.location}</span>
                                  <div className="flex items-center space-x-2 sm:space-x-4">
                                    <span className="flex items-center space-x-1">
                                      <Users size={10} className="sm:w-3 sm:h-3" />
                                      <span className="text-xs">{activity.partySize}</span>
                                    </span>
                                    {activity.reservationNumber && (
                                      <span className="text-xs">#{activity.reservationNumber}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                              {activity.type === 'food' && (
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                                  <span className="truncate">{activity.location}</span>
                                  <div className="flex items-center space-x-2 sm:space-x-4">
                                    <span className="capitalize text-xs">{activity.mealType}</span>
                                    <span className="flex items-center space-x-1">
                                      <Users size={10} className="sm:w-3 sm:h-3" />
                                      <span className="text-xs">{activity.partySize}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <DollarSign size={10} className="sm:w-3 sm:h-3" />
                                      <span className="text-xs">{activity.budget}</span>
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                            {activity.notes && (
                              <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {activity.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgendaView; 