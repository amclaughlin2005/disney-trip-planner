export default async function handler(req, res) {
  // Log environment variables (safely)
  console.log('Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
  console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);

  // Test OpenAI import
  try {
    const OpenAI = require('openai');
    console.log('OpenAI import successful');
    
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('OpenAI client created successfully');
    } else {
      console.log('OPENAI_API_KEY not found');
    }
  } catch (error) {
    console.error('OpenAI import/creation failed:', error);
  }

  return res.json({
    status: 'Test endpoint working',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    keyLength: process.env.OPENAI_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV
  });
} 