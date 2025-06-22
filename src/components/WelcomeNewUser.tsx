import React from 'react';
import { Sparkles, Users, Building, Crown, ArrowRight } from 'lucide-react';
import AccountSetup from './AccountSetup';
import { useUserManagement } from '../hooks/useUserManagement';

const WelcomeNewUser: React.FC = () => {
  const { appUser } = useUserManagement();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <span className="text-5xl mx-auto mb-4 block">🏰</span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Disney Trip Planner! 🏰
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Hello {appUser?.name}! Let's get you set up to start planning magical Disney vacations.
          </p>
          <div className="bg-white rounded-lg shadow-sm p-4 max-w-md mx-auto">
            <p className="text-sm text-gray-500">
              Signed in as: <span className="font-medium">{appUser?.email}</span>
            </p>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <Sparkles className="h-12 w-12 text-disney-purple mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              What's Waiting for You
            </h2>
            <p className="text-gray-600">
              Here's what you'll be able to do once your account is set up:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 rounded-lg border border-gray-100">
              <div className="bg-disney-blue bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Building className="h-6 w-6 text-disney-blue" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Unlimited Trips</h3>
              <p className="text-sm text-gray-600">Plan multiple Disney vacations</p>
            </div>
            
            <div className="text-center p-4 rounded-lg border border-gray-100">
              <div className="bg-disney-green bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-disney-green" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Family Sharing</h3>
              <p className="text-sm text-gray-600">Collaborate with family members</p>
            </div>
            
            <div className="text-center p-4 rounded-lg border border-gray-100 md:col-span-2 lg:col-span-1">
              <div className="bg-disney-purple bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Crown className="h-6 w-6 text-disney-purple" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Account Owner</h3>
              <p className="text-sm text-gray-600">Full control over your account</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-disney-blue to-disney-purple text-white rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Ready to Start Planning?</h3>
            <p className="text-blue-100 mb-4">
              Creating your account will unlock all features and make you the owner of your Disney trip plans.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm">
              <span>It only takes a moment</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Account Setup */}
        <AccountSetup mode="welcome" />
      </div>
    </div>
  );
};

export default WelcomeNewUser; 