const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file if it exists
if (require('fs').existsSync('.env')) {
  require('dotenv').config();
}

// Import API handlers
const openaiHandler = require('./api/openai');
const promptsHandler = require('./api/prompts');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.post('/api/openai', openaiHandler);
app.post('/api/prompts', promptsHandler);

// Test route to debug frontend service
app.post('/api/test-frontend', async (req, res) => {
  try {
    console.log('Test frontend service called');
    
    // Simulate what the frontend service does
    const testPreferences = {
      park: 'Magic Kingdom',
      mealType: 'lunch',
      budget: 'medium',
      groupSize: 4
    };
    
    // Try to get the prompt like the frontend does
    const promptResponse = await fetch('http://localhost:3001/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'getPrompt', category: 'dining' }),
    });
    
    const promptData = await promptResponse.json();
    console.log('Test: Retrieved prompt data:', promptData);
    
    // Now call the OpenAI API with the prompt
    const openaiResponse = await fetch('http://localhost:3001/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'suggestDining', 
        data: { 
          preferences: testPreferences, 
          prompt: promptData.prompt 
        } 
      }),
    });
    
    const openaiData = await openaiResponse.json();
    console.log('Test: OpenAI response:', openaiData);
    
    res.json({
      success: true,
      promptRetrieved: promptData.prompt ? true : false,
      promptName: promptData.prompt?.name,
      openaiResult: openaiData
    });
    
  } catch (error) {
    console.error('Test frontend error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Development API server running on port ${PORT}`);
  console.log(`OpenAI API endpoint: http://localhost:${PORT}/api/openai`);
  console.log(`Prompts API endpoint: http://localhost:${PORT}/api/prompts`);
}); 