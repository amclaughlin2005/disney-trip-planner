# 🤖 OpenAI API Setup Guide

## Getting Your OpenAI API Key

### Step 1: Create OpenAI Account
1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up for an account or log in if you already have one
3. Complete any required verification steps

### Step 2: Generate API Key
1. Navigate to the **API Keys** section in your dashboard
2. Click **"Create new secret key"**
3. Give your key a descriptive name (e.g., "Disney Trip Planner")
4. Copy the generated API key (it starts with `sk-`)
5. **Important**: Save this key securely - you won't be able to see it again!

### Step 3: Add API Key to Your App

#### For Local Development:
1. Create a `.env` file in your project root (same level as `package.json`)
2. Add your API key:
   ```
   REACT_APP_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
3. Restart your development server (`npm start`)

#### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Select your Disney Trip Planner project
3. Go to **Settings** > **Environment Variables**
4. Add a new variable:
   - **Name**: `REACT_APP_OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-`)
   - **Environments**: Production, Preview, Development
5. Redeploy your app

#### For Netlify Deployment:
1. Go to your Netlify dashboard
2. Select your Disney Trip Planner site
3. Go to **Site settings** > **Environment variables**
4. Click **Add a variable**:
   - **Key**: `REACT_APP_OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-`)
5. Redeploy your app

## 💰 Pricing Information

### OpenAI Pricing (as of 2024)
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Typical usage**: Each AI suggestion costs approximately $0.01-0.05
- **Monthly estimate**: Light usage (~50 requests) = $2-5/month

### Free Tier
- New OpenAI accounts get $5 in free credits
- Perfect for testing and light usage
- Credits expire after 3 months

## 🔒 Security Best Practices

### ⚠️ Important Security Notes:
1. **Never commit your API key to Git**
2. **Keep your `.env` file in `.gitignore**
3. **Don't share your API key publicly**
4. **Rotate your key if compromised**

### Production Considerations:
- The current setup uses `dangerouslyAllowBrowser: true`
- For production apps, consider using a backend proxy
- This prevents API key exposure in client-side code

## 🎯 AI Features Available

Once configured, you'll have access to:

### 🗓️ **Trip Itinerary Suggestions**
- Personalized park recommendations
- Activity suggestions based on group preferences
- Budget-conscious planning advice

### ⚡ **Day Optimization**
- Smart scheduling of activities
- Wait time minimization strategies
- Walking distance optimization

### 🍽️ **Dining Recommendations**
- Restaurant suggestions by cuisine/budget
- Reservation timing advice
- Dietary restriction considerations

### 🎢 **Ride Suggestions**
- Attraction recommendations by thrill level
- Lightning Lane strategies
- Best times to visit attractions

### 📋 **Trip Summary**
- Encouraging trip overviews
- Highlight special moments
- Success tips for your vacation

## 🔧 Troubleshooting

### Common Issues:

**"AI features are not configured"**
- Check that your API key is properly set in environment variables
- Ensure the key starts with `sk-`
- Restart your development server after adding the key

**"Failed to generate AI suggestions"**
- Check your OpenAI account has available credits
- Verify your API key hasn't expired
- Check the browser console for detailed error messages

**API key not working in production**
- Verify environment variables are set in your hosting platform
- Redeploy your app after adding environment variables
- Check that the variable name matches exactly: `REACT_APP_OPENAI_API_KEY`

### Getting Help:
- Check the [OpenAI API documentation](https://platform.openai.com/docs)
- Monitor your usage in the OpenAI dashboard
- Contact OpenAI support for API-related issues

## 🚀 Next Steps

1. **Set up your API key** following the steps above
2. **Test the AI features** with a sample trip
3. **Explore different AI suggestions** to see what works best
4. **Monitor your usage** to stay within budget
5. **Consider upgrading** to paid plans for heavy usage

---

**Happy Planning! 🏰✨**

Your Disney Trip Planner now has AI superpowers to make your vacation planning even more magical! 