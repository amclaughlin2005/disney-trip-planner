import React, { useState } from 'react';
import { Shield, Building, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useUserManagement } from '../hooks/useUserManagement';

const AccountSetup: React.FC = () => {
  const { createUserAccount, appUser } = useUserManagement();
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      setError('Please enter an account name');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await createUserAccount(accountName.trim());
      // User will be redirected automatically when account is created
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Account creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="mb-6">
          <Shield className="h-16 w-16 text-disney-blue mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Disney Trip Planner!
          </h1>
          <p className="text-lg text-gray-600">
            Let's set up your account to start planning magical vacations
          </p>
        </div>

        <div className="bg-gradient-to-r from-disney-blue to-disney-purple text-white rounded-lg p-6 mb-8">
          <Sparkles className="h-8 w-8 mx-auto mb-2" />
          <h2 className="text-xl font-semibold mb-2">
            Ready to plan your Disney adventure?
          </h2>
          <p className="text-blue-100">
            Create your account to access all trip planning features
          </p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create Your Account
          </h2>
          <p className="text-gray-600 mb-6">
            Your account will contain all your Disney trip plans and can be shared with family members.
          </p>
        </div>

        <form onSubmit={handleCreateAccount} className="space-y-6">
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
              Account Name
            </label>
            <input
              type="text"
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g., Smith Family, Disney Vacation 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-disney-blue focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              This name will identify your account and can be changed later.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            What you'll get with your account:
          </h3>
          <div className="grid gap-4">
            <div className="flex items-start space-x-3">
              <Building className="h-5 w-5 text-disney-green flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Unlimited Trip Planning</p>
                <p className="text-sm text-gray-500">Create and manage multiple Disney vacation plans</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-disney-purple flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Family Sharing</p>
                <p className="text-sm text-gray-500">Invite family members to collaborate on trip plans</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-disney-blue flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Secure Cloud Storage</p>
                <p className="text-sm text-gray-500">Your trip data is safely stored and accessible anywhere</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Already have an account? Contact your account owner to get access.
        </p>
      </div>
    </div>
  );
};

export default AccountSetup; 