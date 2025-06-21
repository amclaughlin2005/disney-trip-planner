import React, { useState } from 'react';
import { Bot, Sparkles, X, Loader, Lightbulb, Calendar, Utensils, FerrisWheel } from 'lucide-react';
import { Trip, TripDay } from '../types';
import { 
  aiService, 
  ItineraryPreferences, 
  OptimizationPreferences, 
  DiningPreferences, 
  RidePreferences 
} from '../services/openai';

interface AIAssistantProps {
  currentTrip: Trip | null;
  currentDay?: TripDay | null;
  onClose: () => void;
}

type AIFeature = 'itinerary' | 'optimize' | 'dining' | 'rides' | 'summary';

const AIAssistant: React.FC<AIAssistantProps> = ({ currentTrip, currentDay, onClose }) => {
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Form states for different AI features
  const [itineraryPrefs, setItineraryPrefs] = useState<ItineraryPreferences>({
    groupSize: 4,
    ages: [8, 12, 35, 37],
    interests: ['rides', 'characters', 'shows'],
    budget: 'medium',
    mobility: 'high',
    thrillLevel: 'mixed'
  });

  const [optimizationPrefs, setOptimizationPrefs] = useState<OptimizationPreferences>({
    priority: 'balanced',
    crowdTolerance: 'medium',
    walkingDistance: 'moderate'
  });

  const [diningPrefs, setDiningPrefs] = useState<DiningPreferences>({
    mealType: 'lunch',
    budget: 'medium',
    groupSize: 4,
    dietaryRestrictions: []
  });

  const [ridePrefs, setRidePrefs] = useState<RidePreferences>({
    thrillLevel: 'mixed',
    ages: [8, 12, 35, 37],
    interests: ['family-friendly', 'thrill rides']
  });

  const handleFeatureSelect = async (feature: AIFeature) => {
    setSelectedFeature(feature);
    setResult('');
    setError('');

    if (!aiService.isAvailable()) {
      setError('AI features require an OpenAI API key. Please add your API key to environment variables.');
      return;
    }

    if (feature === 'summary' && currentTrip) {
      setIsLoading(true);
      try {
        const summary = await aiService.generateTripSummary(currentTrip);
        setResult(summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate summary');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleItinerarySuggestion = async () => {
    if (!currentTrip) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const suggestions = await aiService.generateItinerarySuggestions(currentTrip, itineraryPrefs);
      setResult(suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate itinerary suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayOptimization = async () => {
    if (!currentDay) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const optimization = await aiService.optimizeDayPlan(currentDay, optimizationPrefs);
      setResult(`
**Suggested Order:**
${optimization.suggestedOrder.map((item, i) => `${i + 1}. ${item}`).join('\n')}

**Tips:**
${optimization.tips.map(tip => `• ${tip}`).join('\n')}

${optimization.warnings.length > 0 ? `**Warnings:**\n${optimization.warnings.map(warning => `⚠️ ${warning}`).join('\n')}` : ''}
      `);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize day plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiningSuggestions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const suggestions = await aiService.suggestDining({
        ...diningPrefs,
        park: currentDay?.park?.name
      });
      
      if (suggestions.length > 0) {
        setResult(suggestions.map(s => `**${s.name}** (${s.location})\n${s.reason}\nEstimated cost: $${s.estimatedCost}\n${s.reservationTips}`).join('\n\n'));
      } else {
        setResult('No specific suggestions available. Try adjusting your preferences.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate dining suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRideSuggestions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const suggestions = await aiService.suggestRides({
        ...ridePrefs,
        park: currentDay?.park?.name
      });
      
      if (suggestions.length > 0) {
        setResult(suggestions.map(s => `**${s.name}** (${s.park})\n${s.reason}\nBest time: ${s.bestTime}\n${s.lightningLaneRecommended ? '⚡ Lightning Lane recommended' : ''}`).join('\n\n'));
      } else {
        setResult('No specific suggestions available. Try adjusting your preferences.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate ride suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const aiFeatures = [
    {
      id: 'itinerary' as AIFeature,
      name: 'Trip Itinerary',
      description: 'Get personalized suggestions for your entire trip',
      icon: Calendar,
      color: 'bg-blue-500',
      available: !!currentTrip
    },
    {
      id: 'optimize' as AIFeature,
      name: 'Optimize Day',
      description: 'Optimize the order and timing of your planned activities',
      icon: Sparkles,
      color: 'bg-purple-500',
      available: !!currentDay && (currentDay.rides.length > 0 || currentDay.food.length > 0)
    },
    {
      id: 'dining' as AIFeature,
      name: 'Dining Suggestions',
      description: 'Get restaurant recommendations based on your preferences',
      icon: Utensils,
      color: 'bg-orange-500',
      available: true
    },
    {
      id: 'rides' as AIFeature,
      name: 'Ride Suggestions',
      description: 'Get attraction recommendations for your group',
      icon: FerrisWheel,
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'summary' as AIFeature,
      name: 'Trip Summary',
      description: 'Get an encouraging overview of your planned trip',
      icon: Lightbulb,
      color: 'bg-yellow-500',
      available: !!currentTrip
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-disney-blue to-disney-purple text-white">
          <div className="flex items-center space-x-3">
            <Bot size={24} />
            <div>
              <h2 className="text-xl font-bold">AI Trip Assistant</h2>
              <p className="text-blue-100 text-sm">Powered by OpenAI • Get personalized Disney recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-100px)]">
          {/* Sidebar */}
          <div className="w-1/3 border-r bg-gray-50 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-800 mb-4">AI Features</h3>
            
            {!aiService.isAvailable() && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Setup Required:</strong> Add your OpenAI API key to enable AI features.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {aiFeatures.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureSelect(feature.id)}
                    disabled={!feature.available || !aiService.isAvailable()}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedFeature === feature.id
                        ? 'border-disney-blue bg-blue-50'
                        : feature.available && aiService.isAvailable()
                        ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${feature.color} ${!feature.available || !aiService.isAvailable() ? 'opacity-50' : ''}`}>
                        <IconComponent size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{feature.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                        {!feature.available && (
                          <p className="text-xs text-red-500 mt-1">
                            {feature.id === 'itinerary' ? 'Requires active trip' : 
                             feature.id === 'optimize' ? 'Requires planned activities' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!selectedFeature ? (
              <div className="text-center py-12">
                <Bot size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Select an AI Feature</h3>
                <p className="text-gray-500">Choose a feature from the sidebar to get started with AI-powered trip planning.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {aiFeatures.find(f => f.id === selectedFeature)?.name}
                </h3>

                {/* Feature-specific forms */}
                {selectedFeature === 'itinerary' && currentTrip && (
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Group Size</label>
                        <input
                          type="number"
                          value={itineraryPrefs.groupSize}
                          onChange={(e) => setItineraryPrefs({...itineraryPrefs, groupSize: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                        <select
                          value={itineraryPrefs.budget}
                          onChange={(e) => setItineraryPrefs({...itineraryPrefs, budget: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                        >
                          <option value="low">Budget-Friendly</option>
                          <option value="medium">Moderate</option>
                          <option value="high">Premium</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleItinerarySuggestion}
                      disabled={isLoading}
                      className="bg-disney-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isLoading ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      <span>{isLoading ? 'Generating...' : 'Get Suggestions'}</span>
                    </button>
                  </div>
                )}

                {selectedFeature === 'optimize' && currentDay && (
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={optimizationPrefs.priority}
                          onChange={(e) => setOptimizationPrefs({...optimizationPrefs, priority: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                        >
                          <option value="rides">Rides First</option>
                          <option value="dining">Dining First</option>
                          <option value="shows">Shows First</option>
                          <option value="balanced">Balanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Crowd Tolerance</label>
                        <select
                          value={optimizationPrefs.crowdTolerance}
                          onChange={(e) => setOptimizationPrefs({...optimizationPrefs, crowdTolerance: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                        >
                          <option value="low">Avoid Crowds</option>
                          <option value="medium">Some Crowds OK</option>
                          <option value="high">Don't Mind Crowds</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Walking</label>
                        <select
                          value={optimizationPrefs.walkingDistance}
                          onChange={(e) => setOptimizationPrefs({...optimizationPrefs, walkingDistance: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                        >
                          <option value="minimal">Minimize Walking</option>
                          <option value="moderate">Moderate Walking</option>
                          <option value="extensive">Lots of Walking OK</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleDayOptimization}
                      disabled={isLoading}
                      className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isLoading ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      <span>{isLoading ? 'Optimizing...' : 'Optimize Day'}</span>
                    </button>
                  </div>
                )}

                {selectedFeature === 'dining' && (
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                        <select
                          value={diningPrefs.mealType}
                          onChange={(e) => setDiningPrefs({...diningPrefs, mealType: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snack">Snack</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                        <select
                          value={diningPrefs.budget}
                          onChange={(e) => setDiningPrefs({...diningPrefs, budget: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                        >
                          <option value="low">Budget-Friendly</option>
                          <option value="medium">Moderate</option>
                          <option value="high">Premium</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleDiningSuggestions}
                      disabled={isLoading}
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isLoading ? <Loader size={16} className="animate-spin" /> : <Utensils size={16} />}
                      <span>{isLoading ? 'Finding Options...' : 'Get Dining Suggestions'}</span>
                    </button>
                  </div>
                )}

                {selectedFeature === 'rides' && (
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thrill Level</label>
                        <select
                          value={ridePrefs.thrillLevel}
                          onChange={(e) => setRidePrefs({...ridePrefs, thrillLevel: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                        >
                          <option value="mild">Mild & Family-Friendly</option>
                          <option value="moderate">Moderate Thrills</option>
                          <option value="intense">Intense Thrills</option>
                          <option value="mixed">Mix of All</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Available</label>
                        <select
                          value={ridePrefs.timeAvailable || 'full-day'}
                          onChange={(e) => setRidePrefs({...ridePrefs, timeAvailable: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue"
                        >
                          <option value="half-day">Half Day</option>
                          <option value="full-day">Full Day</option>
                          <option value="evening">Evening Only</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleRideSuggestions}
                      disabled={isLoading}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isLoading ? <Loader size={16} className="animate-spin" /> : <FerrisWheel size={16} />}
                      <span>{isLoading ? 'Finding Rides...' : 'Get Ride Suggestions'}</span>
                    </button>
                  </div>
                )}

                {/* Results */}
                {error && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                {result && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                      <Sparkles size={16} className="text-disney-blue" />
                      <span>AI Suggestions</span>
                    </h4>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{result}</pre>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="text-center py-8">
                    <Loader size={32} className="animate-spin text-disney-blue mx-auto mb-4" />
                    <p className="text-gray-600">AI is generating your personalized suggestions...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant; 