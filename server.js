const express = require('express');
const cors = require('cors');
const path = require('path');

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

app.listen(PORT, () => {
  console.log(`Development API server running on port ${PORT}`);
  console.log(`OpenAI API endpoint: http://localhost:${PORT}/api/openai`);
  console.log(`Prompts API endpoint: http://localhost:${PORT}/api/prompts`);
}); 