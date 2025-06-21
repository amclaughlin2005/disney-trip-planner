import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Settings, UserPlus, Trash2, Edit, Crown, X, Mail, User, Building, ArrowRight, UserCheck, Eye, LogOut, ArrowLeft } from 'lucide-react';
import { AppUser, UserAccount } from '../types';
import { useUserManagement } from '../hooks/useUserManagement';

// This would normally come from your backend API
// For now, we'll simulate it with localStorage
const SUPER_ADMIN_EMAIL = 'amclaughlin2005@gmail.com'; // Replace with your email

interface AddUserForm {
  email: string;
  name: string;
  accountId: string;
  role: string;
}

interface AssignUserForm {
  userId: string;
  accountId: string;
  role: string;
}

export const AdminPanel: React.FC = () => {
  const { user } = useUser();
  const {
    getAllUsers,
    getAllAccounts,
    assignUserToAccount,
    removeUserFromAccount,
    deleteAccount,
    updateUserAccount,
    isSuperAdmin,
    isImpersonating,
    impersonatedUser,
    impersonatedAccount,
    originalUser,
    startImpersonation,
    stopImpersonation,
    switchToAccount
  } = useUserManagement();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'users' | 'accounts' | 'impersonation' | 'settings'>('users');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState<AddUserForm>({
    email: '',
    name: '',
    accountId: '',
    role: 'viewer'
  });
  const [assignUserForm, setAssignUserForm] = useState<AssignUserForm>({
    userId: '',
    accountId: '',
    role: 'viewer'
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [assignUserLoading, setAssignUserLoading] = useState(false);

  // Check if current user is super admin
  const isCurrentUserSuperAdmin = user?.primaryEmailAddress?.emailAddress === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (isCurrentUserSuperAdmin) {
      loadAdminData();
    }
  }, [isCurrentUserSuperAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersData, accountsData] = await Promise.all([
        getAllUsers(),
        getAllAccounts()
      ]);
      
      setUsers(usersData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    const accountName = prompt('Enter account name:');
    if (!accountName) return;

    try {
      const newAccount: UserAccount = {
        id: `account-${Date.now()}`,
        name: accountName,
        ownerId: user?.id || '',
        subscriptionStatus: 'trial',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const accounts = JSON.parse(localStorage.getItem('admin-accounts') || '[]');
      accounts.push(newAccount);
      localStorage.setItem('admin-accounts', JSON.stringify(accounts));
      
      await loadAdminData();
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Error creating account. Please try again.');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this account? This will remove all associated users and data.')) {
      try {
        await deleteAccount(accountId);
        await loadAdminData();
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account. Please try again.');
      }
    }
  };

  const toggleUserSuperAdmin = async (userId: string) => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('admin-users') || '[]');
      const updatedUsers = storedUsers.map((u: AppUser) => 
        u.clerkId === userId 
          ? { ...u, isSuperAdmin: !u.isSuperAdmin }
          : u
      );
      localStorage.setItem('admin-users', JSON.stringify(updatedUsers));
      await loadAdminData();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please try again.');
    }
  };

  const handleAddUser = () => {
    setAddUserForm({
      email: '',
      name: '',
      accountId: '',
      role: 'viewer'
    });
    setShowAddUserModal(true);
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserLoading(true);

    try {
      // Validate form
      if (!addUserForm.email || !addUserForm.name) {
        alert('Please fill in all required fields');
        return;
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email === addUserForm.email);
      if (existingUser) {
        alert('A user with this email already exists');
        return;
      }

      // Create new user (in a real app, this would send an invitation email)
      const newUser: AppUser = {
        clerkId: `temp-${Date.now()}`, // Temporary ID until user signs up with Clerk
        email: addUserForm.email,
        name: addUserForm.name,
        accountId: addUserForm.accountId || undefined,
        role: addUserForm.role as any,
        isSuperAdmin: false,
        createdAt: new Date().toISOString(),
        lastLogin: undefined, // Will be set when user first logs in
        invitedBy: user?.id,
        invitedAt: new Date().toISOString(),
        status: 'invited' // Custom status to track invitation state
      };

      const storedUsers = JSON.parse(localStorage.getItem('admin-users') || '[]');
      storedUsers.push(newUser);
      localStorage.setItem('admin-users', JSON.stringify(storedUsers));

      // Reset form and close modal
      setAddUserForm({
        email: '',
        name: '',
        accountId: '',
        role: 'viewer'
      });
      setShowAddUserModal(false);

      await loadAdminData();
      alert(`User invitation sent to ${addUserForm.email}! They will receive an email to join the platform.`);
      
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user. Please try again.');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleAssignUser = (userId: string) => {
    setAssignUserForm({
      userId: userId,
      accountId: '',
      role: 'viewer'
    });
    setShowAssignUserModal(true);
  };

  const handleAssignUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignUserLoading(true);

    try {
      if (!assignUserForm.accountId) {
        alert('Please select an account');
        return;
      }

      await assignUserToAccount(
        assignUserForm.userId,
        assignUserForm.accountId,
        assignUserForm.role as any
      );

      setShowAssignUserModal(false);
      setAssignUserForm({
        userId: '',
        accountId: '',
        role: 'viewer'
      });

      await loadAdminData();
      alert('User successfully assigned to account!');

    } catch (error) {
      console.error('Error assigning user:', error);
      alert('Error assigning user. Please try again.');
    } finally {
      setAssignUserLoading(false);
    }
  };

  const handleRemoveUserFromAccount = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user from their account?')) {
      try {
        await removeUserFromAccount(userId);
        await loadAdminData();
        alert('User removed from account successfully!');
      } catch (error) {
        console.error('Error removing user from account:', error);
        alert('Error removing user from account. Please try again.');
      }
    }
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('admin-users') || '[]');
        const updatedUsers = storedUsers.filter((u: AppUser) => u.clerkId !== userId);
        localStorage.setItem('admin-users', JSON.stringify(updatedUsers));
        await loadAdminData();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
    }
  };

  const getAccountName = (accountId: string | undefined): string => {
    if (!accountId) return 'No Account';
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const getUnassignedUsers = (): AppUser[] => {
    // Include super admins in the assignment list so they can be assigned to accounts
    return users.filter(u => !u.accountId);
  };

  const handleImpersonateUser = async (userId: string) => {
    const success = await startImpersonation(userId);
    if (success) {
      alert('Successfully switched to user context. You can now view and edit as this user.');
    } else {
      alert('Failed to impersonate user. Please try again.');
    }
  };

  const handleSwitchToAccount = async (accountId: string) => {
    const success = await switchToAccount(accountId);
    if (success) {
      alert('Successfully switched to account context. You can now view and edit account data.');
    } else {
      alert('Failed to switch to account. Please try again.');
    }
  };

  const handleStopImpersonation = () => {
    stopImpersonation();
    alert('Returned to your super admin context.');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (!isCurrentUserSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Disney Trip Planner</h1>
              <p className="text-sm text-gray-500 mt-1">Super Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Trip Planner</span>
            </button>
            {isImpersonating && (
              <div className="flex items-center space-x-2">
                <div className="bg-orange-100 border border-orange-300 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Impersonating: {impersonatedUser?.name || 'Unknown User'}
                      {impersonatedAccount && ` (${impersonatedAccount.name})`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleStopImpersonation}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Stop Impersonating</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-600">
          Manage users, accounts, and system settings
          {isImpersonating && (
            <span className="text-orange-600 ml-2">
              • Currently viewing as {impersonatedUser?.name}
            </span>
          )}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'accounts', label: 'Accounts', icon: Shield },
            { id: 'impersonation', label: 'Impersonation', icon: Eye },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-disney-blue text-disney-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-disney-blue mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading admin data...</p>
        </div>
      ) : (
        <>
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  {getUnassignedUsers().length > 0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      {getUnassignedUsers().length} user(s) need account assignment
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddUser}
                    className="flex items-center space-x-2 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <UserPlus size={16} />
                    <span>Add User</span>
                  </button>
                  {getUnassignedUsers().length > 0 && (
                    <button
                      onClick={() => handleAssignUser('')}
                      className="flex items-center space-x-2 px-4 py-2 bg-disney-green text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <UserCheck size={16} />
                      <span>Assign Users</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          No users found. Users will appear here once they sign in.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.clerkId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span>{getAccountName(user.accountId)}</span>
                              {!user.accountId && !user.isSuperAdmin && (
                                <button
                                  onClick={() => handleAssignUser(user.clerkId)}
                                  className="text-disney-blue hover:text-blue-600"
                                  title="Assign to account"
                                >
                                  <ArrowRight size={14} />
                                </button>
                              )}
                              {user.accountId && (
                                <button
                                  onClick={() => handleRemoveUserFromAccount(user.clerkId)}
                                  className="text-orange-600 hover:text-orange-800"
                                  title="Remove from account"
                                >
                                  <UserCheck size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isSuperAdmin 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : user.role === 'owner'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.isSuperAdmin ? 'Super Admin' : user.role || 'User'}
                              </span>
                              {user.status === 'invited' && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                  Invited
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleImpersonateUser(user.clerkId)}
                                className="text-purple-600 hover:text-purple-800"
                                title="Impersonate user"
                                disabled={user.isSuperAdmin}
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => toggleUserSuperAdmin(user.clerkId)}
                                className="text-disney-blue hover:text-blue-600"
                                title={user.isSuperAdmin ? 'Remove super admin' : 'Make super admin'}
                              >
                                <Crown size={16} />
                              </button>
                              <button className="text-gray-400 hover:text-gray-600">
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteUser(user.clerkId)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove user"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Account Management</h2>
                <button
                  onClick={createAccount}
                  className="flex items-center space-x-2 px-4 py-2 bg-disney-green text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </button>
              </div>

              <div className="grid gap-6">
                {accounts.length === 0 ? (
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No accounts created yet.</p>
                  </div>
                ) : (
                  accounts.map((account) => (
                    <div key={account.id} className="bg-white shadow rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                          <p className="text-sm text-gray-500">Account ID: {account.id}</p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(account.createdAt).toLocaleDateString()}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                            account.subscriptionStatus === 'active'
                              ? 'bg-green-100 text-green-800'
                              : account.subscriptionStatus === 'trial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {account.subscriptionStatus || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSwitchToAccount(account.id)}
                            className="text-purple-600 hover:text-purple-800"
                            title="Switch to account context"
                          >
                            <Eye size={16} />
                          </button>
                          <button className="text-disney-blue hover:text-blue-600">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(account.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

                     {/* Impersonation Tab */}
           {activeTab === 'impersonation' && (
             <div>
               <h2 className="text-xl font-semibold text-gray-900 mb-6">User & Account Impersonation</h2>
               
               {/* Current Impersonation Status */}
               <div className="bg-white shadow rounded-lg p-6 mb-6">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
                 {isImpersonating ? (
                   <div className="space-y-4">
                     <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="flex items-center space-x-2 mb-2">
                             <Eye className="h-5 w-5 text-orange-600" />
                             <span className="font-medium text-orange-800">Currently Impersonating</span>
                           </div>
                           <div className="text-sm text-gray-700">
                             <p><strong>User:</strong> {impersonatedUser?.name} ({impersonatedUser?.email})</p>
                             <p><strong>Account:</strong> {impersonatedAccount?.name || 'No Account'}</p>
                             <p><strong>Role:</strong> {impersonatedUser?.role || 'No Role'}</p>
                           </div>
                         </div>
                         <button
                           onClick={handleStopImpersonation}
                           className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                         >
                           <LogOut size={16} />
                           <span>Stop Impersonating</span>
                         </button>
                       </div>
                     </div>
                     <div className="text-sm text-gray-600">
                       <p><strong>Original User:</strong> {originalUser?.name} ({originalUser?.email})</p>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-8 text-gray-500">
                     <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                     <p>No active impersonation</p>
                     <p className="text-sm mt-1">Use the eye icons in the Users or Accounts tabs to start impersonating</p>
                   </div>
                 )}
               </div>

               {/* Quick Access */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Quick User Impersonation */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Quick User Impersonation</h3>
                   <div className="space-y-3">
                     {users.filter(u => !u.isSuperAdmin).slice(0, 5).map(user => (
                       <div key={user.clerkId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                         <div>
                           <p className="font-medium text-gray-900">{user.name}</p>
                           <p className="text-sm text-gray-500">{getAccountName(user.accountId)}</p>
                         </div>
                         <button
                           onClick={() => handleImpersonateUser(user.clerkId)}
                           className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm"
                         >
                           <Eye size={14} />
                           <span>Impersonate</span>
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Quick Account Switching */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Account Switching</h3>
                   <div className="space-y-3">
                     {accounts.slice(0, 5).map(account => (
                       <div key={account.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                         <div>
                           <p className="font-medium text-gray-900">{account.name}</p>
                           <p className="text-sm text-gray-500">{account.subscriptionStatus}</p>
                         </div>
                         <button
                           onClick={() => handleSwitchToAccount(account.id)}
                           className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm"
                         >
                           <Eye size={14} />
                           <span>Switch</span>
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>

               {/* Warning */}
               <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                 <div className="flex items-start">
                   <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                   <div>
                     <h4 className="text-sm font-medium text-yellow-800">Impersonation Guidelines</h4>
                     <div className="text-sm text-yellow-700 mt-1">
                       <ul className="list-disc list-inside space-y-1">
                         <li>Use impersonation only for support and troubleshooting purposes</li>
                         <li>Always inform users when accessing their account for support</li>
                         <li>Log all impersonation activities for audit purposes</li>
                         <li>Return to your admin context when finished</li>
                       </ul>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Super Admin Settings</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Configure system-wide settings and permissions.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Current Super Admin:</strong> {user.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Application Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                        <div className="text-sm text-blue-600">Total Users</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{accounts.length}</div>
                        <div className="text-sm text-green-600">Total Accounts</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    id="email"
                    required
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    id="name"
                    required
                    value={addUserForm.name}
                    onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
                  Account
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    id="accountId"
                    value={addUserForm.accountId}
                    onChange={(e) => setAddUserForm({ ...addUserForm, accountId: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                  >
                    <option value="">No Account (Super Admin will assign later)</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={addUserForm.role}
                  onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                >
                  <option value="viewer">Viewer (Read only)</option>
                  <option value="editor">Editor (Can create/edit trips)</option>
                  <option value="admin">Admin (Can manage users)</option>
                  <option value="owner">Owner (Full account access)</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <Mail className="text-blue-500 mt-0.5" size={16} />
                  <div className="ml-2">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> The user will receive an invitation email to join the platform. 
                      They'll need to create a Clerk account to access the system.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addUserLoading}
                  className="flex-1 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addUserLoading ? 'Adding...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assign User to Account</h3>
              <button
                onClick={() => setShowAssignUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignUserSubmit} className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    id="userId"
                    value={assignUserForm.userId}
                    onChange={(e) => setAssignUserForm({ ...assignUserForm, userId: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                  >
                    <option value="">Select a user</option>
                    {getUnassignedUsers().map(user => (
                      <option key={user.clerkId} value={user.clerkId}>
                        {user.name} {user.isSuperAdmin ? '(Super Admin)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Debug info */}
                <div className="mt-1 text-xs text-gray-500">
                  Available users: {getUnassignedUsers().length} 
                  {getUnassignedUsers().length === 0 && ' (All users are already assigned to accounts)'}
                </div>
              </div>

              <div>
                <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
                  Account
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    id="accountId"
                    value={assignUserForm.accountId}
                    onChange={(e) => setAssignUserForm({ ...assignUserForm, accountId: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                  >
                    <option value="">Select an account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={assignUserForm.role}
                  onChange={(e) => setAssignUserForm({ ...assignUserForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                >
                  <option value="viewer">Viewer (Read only)</option>
                  <option value="editor">Editor (Can create/edit trips)</option>
                  <option value="admin">Admin (Can manage users)</option>
                  <option value="owner">Owner (Full account access)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignUserLoading}
                  className="flex-1 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignUserLoading ? 'Assigning...' : 'Assign User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 