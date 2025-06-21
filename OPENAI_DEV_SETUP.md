# OpenAI Development Setup

## Issue Fixed

The OpenAI API integration was returning 404 errors in local development because Create React App doesn't serve API routes from the `api/` folder. This has been fixed by creating a development server.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with:

```
OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

### 3. Development Mode

For local development, run:

```bash
npm run dev
```

This will start:
- React app on `http://localhost:3000`
- API server on `http://localhost:3001`

### 4. Production Mode

In production (Vercel), the API routes work automatically as serverless functions.

## How It Works

### Development
- The OpenAI service detects `NODE_ENV === 'development'`
- Makes API calls to `http://localhost:3001/api/openai`
- Express server (`server.js`) handles the OpenAI API integration

### Production (Vercel)
- The OpenAI service uses `/api/openai` (relative path)
- Vercel serves the `api/openai.js` file as a serverless function
- No additional setup required

## Files Modified

1. **`server.js`** - New development API server
2. **`package.json`** - Added dependencies and scripts
3. **`src/services/openai.ts`** - Environment-aware API endpoint
4. **`OPENAI_DEV_SETUP.md`** - This documentation

## Troubleshooting

### API 404 Errors
- Make sure to run `npm run dev` instead of `npm start` for development
- Verify the API server is running on port 3001
- Check that environment variables are set correctly

### CORS Issues
- The development server includes CORS middleware
- Production on Vercel handles CORS automatically

### OpenAI API Errors
- Verify your `OPENAI_API_KEY` is valid and has credits
- Check the console for specific error messages
- Ensure the API key is set in your environment variables (not in code) 