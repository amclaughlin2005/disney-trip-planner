# Clerk Authentication Setup Guide 🔐

This guide will help you set up Clerk authentication for your Disney Trip Planner app.

## Step 1: Create Clerk Account

1. **Go to [Clerk Dashboard](https://dashboard.clerk.dev/)**
2. **Sign up** for a free account
3. **Create a new application**
   - Choose "React" as your framework
   - Name it "Disney Trip Planner"

## Step 2: Get Your API Keys

1. **In Clerk Dashboard**, go to **API Keys**
2. **Copy your keys**:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

## Step 3: Configure Environment Variables

Create a `.env` file in your project root (if you don't have one):

```bash
# Clerk Authentication
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Optional: For backend operations (not needed for basic setup)
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

**⚠️ Important**: Never commit your `.env` file to version control!

## Step 4: Configure Vercel Environment Variables

### For Production Deployment:

1. **Go to your Vercel Dashboard**
2. **Select your Disney Trip Planner project**
3. **Go to Settings > Environment Variables**
4. **Add these variables**:

```
REACT_APP_CLERK_PUBLISHABLE_KEY = pk_test_your_publishable_key_here
CLERK_SECRET_KEY = sk_test_your_secret_key_here
```

### For All Environments:
- Set both for **Production**, **Preview**, and **Development**
- Use the same test keys for all environments initially

## Step 5: Configure Super Admin

1. **Open** `src/components/AdminPanel.tsx`
2. **Find line 8**: 
   ```typescript
   const SUPER_ADMIN_EMAIL = 'your-email@example.com';
   ```
3. **Replace** with your actual email address:
   ```typescript
   const SUPER_ADMIN_EMAIL = 'youremail@gmail.com';
   ```

4. **Do the same** in `src/hooks/useUserManagement.ts` (line 6)

## Step 6: Test the Setup

1. **Start your development server**:
   ```bash
   npm start
   ```

2. **You should see**:
   - A login page when not authenticated
   - Access to the app once signed in
   - Admin panel access if you're the super admin

## Step 7: Deploy to Vercel

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add Clerk authentication"
   git push
   ```

2. **Vercel will automatically deploy** with your environment variables

## Features You Now Have

### 🔐 **Authentication**
- Secure login/logout with Clerk
- User profile management
- Password reset functionality

### 👤 **User Management**
- Super admin panel (for you only)
- Account creation and management
- Role-based permissions

### 🏢 **Multi-Account Support**
- Users can create accounts
- Share accounts with family members
- Role-based access control

### 🔒 **Permissions**
- **Super Admin**: Full system access
- **Account Owner**: Full account management
- **Account Admin**: User management + trip editing
- **Account Editor**: Trip creation and editing
- **Account Viewer**: Read-only access

## User Journey

1. **New User Signs Up** → Clerk handles authentication
2. **First Login** → User sees account setup screen
3. **Creates Account** → Becomes account owner
4. **Invites Family** → Can share account access
5. **Plans Trips** → Role-based permissions apply

## Troubleshooting

### "Missing Clerk Publishable Key" Error
- ✅ Check your `.env` file exists
- ✅ Verify the key starts with `pk_test_`
- ✅ Restart your development server
- ✅ In Vercel, check environment variables are set

### "Access Denied" in Admin Panel
- ✅ Verify your email in the super admin configuration
- ✅ Sign out and sign in again
- ✅ Check browser console for errors

### App Not Loading After Authentication
- ✅ Check browser console for errors
- ✅ Verify all environment variables are set
- ✅ Try clearing browser cache/localStorage

## Security Best Practices

### ✅ **Environment Variables**
- Never commit `.env` to version control
- Use different keys for production/development
- Rotate keys regularly

### ✅ **Super Admin Access**
- Only set your email as super admin
- Use a secure email account
- Consider using a dedicated admin email

### ✅ **User Permissions**
- Follow principle of least privilege
- Regularly review user access
- Monitor admin panel usage

## Advanced Configuration

### Custom Branding (Optional)
You can customize Clerk's appearance to match your Disney theme:

1. **In Clerk Dashboard** → **Customization**
2. **Upload your logo**
3. **Set brand colors**:
   - Primary: `#1e40af` (Disney Blue)
   - Secondary: `#7c3aed` (Disney Purple)

### Webhooks (Optional)
For advanced user management, you can set up webhooks:

1. **In Clerk Dashboard** → **Webhooks**
2. **Add endpoint**: `https://your-app.vercel.app/api/clerk-webhook`
3. **Select events**: `user.created`, `user.updated`, `user.deleted`

## Support

### Getting Help:
- **Clerk Documentation**: https://clerk.dev/docs
- **Clerk Discord**: https://discord.com/invite/b5rXHjbQrG
- **GitHub Issues**: Create an issue in your repository

### Common Issues:
- **Authentication loops**: Clear browser storage
- **Missing permissions**: Check user role assignments
- **Deployment errors**: Verify environment variables

---

## 🎉 You're All Set!

Your Disney Trip Planner now has:
- 🔐 **Secure authentication** with Clerk
- 👥 **Multi-user support** with accounts
- 🛡️ **Role-based permissions**
- 👑 **Super admin management**
- 🚀 **Production-ready deployment**

**Start planning magical Disney vacations with secure user management!** 🏰✨

---

## Quick Reference

### Environment Variables:
```bash
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Admin Setup:
```typescript
const SUPER_ADMIN_EMAIL = 'your-email@example.com';
```

### Deployment:
```bash
git add . && git commit -m "Add authentication" && git push
``` 