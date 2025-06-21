const express = require('express');
const cors = require('cors');
const path = require('path');

// Import the OpenAI API handler
const openaiHandler = require('./api/openai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.post('/api/openai', openaiHandler);

app.listen(PORT, () => {
  console.log(`Development API server running on port ${PORT}`);
  console.log(`OpenAI API endpoint: http://localhost:${PORT}/api/openai`);
}); 