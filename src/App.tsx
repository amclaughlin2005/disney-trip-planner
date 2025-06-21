import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Crown } from 'lucide-react';
import AuthWrapper from './components/AuthWrapper';
import TripManager from './components/TripManager';
import { AdminPanel } from './components/AdminPanel';
import AccountSetup from './components/AccountSetup';
import { useUserManagement } from './hooks/useUserManagement';
import { Trip } from './types';
import './index.css';

// Main App Component (Trip Planning Interface)
const MainApp: React.FC = () => {
  const { user: clerkUser } = useUser();
  const { 
    appUser, 
    userAccount, 
    isImpersonating,
    impersonatedUser,
    impersonatedAccount
  } = useUserManagement();

  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  // Show account setup if user exists but no app user profile
  if (clerkUser && !appUser) {
    return <AccountSetup />;
  }

  // Show message if user doesn't have access to any account
  if (appUser && !userAccount && !isImpersonating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Access Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be assigned to an account to access the Disney Trip Planner. 
            {appUser.isSuperAdmin 
              ? ' As a super admin, you can access the admin panel to assign yourself to an account.'
              : ' Please contact your administrator to get access.'
            }
          </p>
          <div className="text-sm text-gray-500 mb-6">
            Logged in as: {appUser.name} ({appUser.email})
          </div>
          
          {/* Admin Panel Access for Super Admins */}
          {appUser.isSuperAdmin && (
            <button
              onClick={() => window.location.href = '/admin'}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              <Crown className="h-5 w-5" />
              <span>Access Admin Panel</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleTripSelect = (trip: Trip) => {
    setCurrentTrip(trip);
  };

  const handleTripCreate = (trip: Trip) => {
    setCurrentTrip(trip);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium">
          🔍 Super Admin View: Currently viewing as {impersonatedUser?.name || 'Unknown User'}
          {impersonatedAccount && ` (${impersonatedAccount.name})`}
        </div>
      )}
      
      {/* Main Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Disney Trip Planner</h1>
                {userAccount && (
                  <p className="text-sm text-gray-600">
                    {userAccount.name} • {appUser?.role || 'Member'}
                    {isImpersonating && (
                      <span className="text-orange-600 ml-2">
                        (Impersonated View)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Welcome, {appUser?.name || 'User'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TripManager
          currentTrip={currentTrip}
          onTripSelect={handleTripSelect}
          onTripCreate={handleTripCreate}
        />
      </div>
    </div>
  );
};

// Admin Route Component
const AdminRoute: React.FC = () => {
  const { appUser } = useUserManagement();
  
  // Only super admins can access admin panel
  if (!appUser?.isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminPanel />;
};

// Main App with Router
const App: React.FC = () => {
  return (
    <AuthWrapper>
      <Router>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthWrapper>
  );
};

export default App; 