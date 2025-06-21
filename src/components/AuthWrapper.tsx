import React from 'react';
import { ClerkProvider, useAuth, useUser, SignInButton, UserButton } from '@clerk/clerk-react';
import { Shield, LogIn } from 'lucide-react';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthContent: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-disney-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Authentication Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-disney-blue" />
              <h1 className="text-xl font-bold text-gray-900">
                Disney Trip Planner
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8"
                    }
                  }}
                />
              ) : (
                <SignInButton mode="modal">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isSignedIn ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mb-8">
              <Shield className="h-24 w-24 text-disney-blue mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Disney Trip Planner
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Plan your magical Disney vacation with our comprehensive trip planning tool.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                🏰 Features
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold text-disney-blue mb-2">🗓️ Trip Management</h3>
                  <p className="text-gray-600">Organize multiple trip days with park selections</p>
                </div>
                <div>
                  <h3 className="font-semibold text-disney-green mb-2">🎢 Rides & Attractions</h3>
                  <p className="text-gray-600">Plan attractions with priority levels and FastPass</p>
                </div>
                <div>
                  <h3 className="font-semibold text-disney-purple mb-2">🍽️ Dining Plans</h3>
                  <p className="text-gray-600">Manage reservations and food preferences</p>
                </div>
                <div>
                  <h3 className="font-semibold text-disney-orange mb-2">🚗 Transportation</h3>
                  <p className="text-gray-600">Plan getting around the parks efficiently</p>
                </div>
              </div>
            </div>

            <SignInButton mode="modal">
              <button className="flex items-center justify-center space-x-2 px-8 py-4 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium mx-auto">
                <LogIn size={20} />
                <span>Get Started - Sign In</span>
              </button>
            </SignInButton>

            <p className="text-sm text-gray-500 mt-4">
              Sign in to start planning your magical Disney adventure!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthContent>{children}</AuthContent>
    </ClerkProvider>
  );
};

export default AuthWrapper; 