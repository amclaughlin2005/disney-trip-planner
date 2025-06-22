import React, { useState } from 'react';
import { aiService } from '../services/openai';
import type { Trip, TripDay } from '../types';
import { PARKS } from '../types';

const TestStructuredOutputs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [error, setError] = useState<string>('');

  // Sample test data
  const sampleTrip: Trip = {
    id: 'test-trip',
    name: 'Test Disney Trip',
    startDate: '2024-07-01',
    endDate: '2024-07-03',
    assignedProfileIds: [], // Initialize with empty assigned profiles for testing
    days: [
      {
        id: 'day-1',
        date: '2024-07-01',
        park: PARKS.find(p => p.id === 'mk') || null,
        transportation: [],
        rides: [{
          id: 'space-mountain',
          name: 'Space Mountain',
          park: 'Magic Kingdom',
          type: 'attraction',
          priority: 'must-do',
          duration: 45,
          color: 'disney-blue'
        }],
        food: [{
          id: 'dole-whip',
          name: 'Dole Whip',
          type: 'snack',
          location: 'Adventureland',
          mealType: 'snack',
          timeSlot: '2:00 PM',
          partySize: 4,
          budget: 15,
          color: 'disney-yellow'
        }],
        reservations: [{
          id: 'dinner',
          name: 'Be Our Guest',
          type: 'dining',
          location: 'Magic Kingdom',
          date: '2024-07-01',
          time: '6:00 PM',
          partySize: 4,
          color: 'disney-green'
        }]
      }
    ],
    resort: {
      id: 'polynesian',
      name: 'Disney\'s Polynesian Village Resort',
      category: 'deluxe',
      location: 'Magic Kingdom Area',
      transportation: ['monorail', 'boat']
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    accountId: 'test-account',
    createdBy: 'test-user'
  };

  const sampleDay: TripDay = sampleTrip.days[0];

  const testItinerarySuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await aiService.generateItinerarySuggestions(sampleTrip, {
        groupSize: 4,
        ages: [8, 12, 35, 40],
        interests: ['thrill rides', 'character dining'],
        budget: 'medium',
        mobility: 'high',
        thrillLevel: 'moderate'
      });
      setResults((prev: any) => ({ ...prev, itinerary: result }));
    } catch (err) {
      setError(`Itinerary test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const testDayOptimization = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await aiService.optimizeDayPlan(sampleDay, {
        priority: 'balanced',
        crowdTolerance: 'medium',
        walkingDistance: 'moderate'
      });
      setResults((prev: any) => ({ ...prev, optimization: result }));
    } catch (err) {
      setError(`Optimization test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const testDining = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await aiService.suggestDining({
        park: 'Magic Kingdom',
        mealType: 'lunch',
        budget: 'medium',
        groupSize: 4,
        dietaryRestrictions: ['vegetarian']
      });
      setResults((prev: any) => ({ ...prev, dining: result }));
    } catch (err) {
      setError(`Dining test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const testRides = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await aiService.suggestRides({
        park: 'Magic Kingdom',
        thrillLevel: 'moderate',
        ages: [8, 12],
        interests: ['fantasy', 'adventure']
      });
      setResults((prev: any) => ({ ...prev, rides: result }));
    } catch (err) {
      setError(`Rides test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const testTripSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await aiService.generateTripSummary(sampleTrip);
      setResults((prev: any) => ({ ...prev, summary: result }));
    } catch (err) {
      setError(`Summary test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const testAll = async () => {
    await testItinerarySuggestions();
    await testDayOptimization();
    await testDining();
    await testRides();
    await testTripSummary();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Test Structured Outputs</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={testAll}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test All'}
        </button>
        <button
          onClick={testItinerarySuggestions}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Itinerary
        </button>
        <button
          onClick={testDayOptimization}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Optimization
        </button>
        <button
          onClick={testDining}
          disabled={loading}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
        >
          Test Dining
        </button>
        <button
          onClick={testRides}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Test Rides
        </button>
        <button
          onClick={testTripSummary}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Test Summary
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
              {key} Results
            </h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestStructuredOutputs; 