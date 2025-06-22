import React, { useState } from 'react';
import { aiService } from '../services/openai';

const TestPrompts: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDiningPrompts = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('=== TESTING CUSTOM PROMPTS ===');
      
      const suggestions = await aiService.suggestDining({
        park: 'Magic Kingdom',
        mealType: 'lunch',
        budget: 'medium',
        groupSize: 4
      });
      
      console.log('Dining suggestions result:', suggestions);
      setResult(JSON.stringify(suggestions, null, 2));
      
    } catch (error) {
      console.error('Test error:', error);
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-yellow-50">
      <h3 className="text-lg font-bold mb-2">🧪 Test Custom Prompts</h3>
      <p className="text-sm text-gray-600 mb-4">
        This will test if custom prompts are working. Check the browser console for detailed logs.
      </p>
      
      <button
        onClick={testDiningPrompts}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Dining Prompts'}
      </button>
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          <h4 className="font-semibold mb-2">Result:</h4>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Expected:</strong> If custom prompts are working, the result should contain "CUSTOM PROMPT DETECTED"</p>
        <p><strong>Console:</strong> Check browser console for detailed debugging information</p>
      </div>
    </div>
  );
};

export default TestPrompts; 