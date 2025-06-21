import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Settings, UserPlus, Trash2, Edit, Crown, X, Mail, User, Building, ArrowRight, UserCheck, Eye, LogOut, ArrowLeft, MessageSquare, Save, RotateCcw } from 'lucide-react';
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

interface AIPrompt {
  id: string;
  name: string;
  description: string;
  systemMessage: string;
  userPromptTemplate: string;
  category: 'itinerary' | 'optimization' | 'dining' | 'rides' | 'summary';
  maxTokens: number;
  lastModified: string;
}

export const AdminPanel: React.FC = () => {
  const { user } = useUser();
  const {
    getAllUsers,
    getAllAccounts,
    assignUserToAccount,
    removeUserFromAccount,
    deleteAccount,
    isImpersonating,
    impersonatedUser,
    impersonatedAccount,
    originalUser,
    startImpersonation,
    stopImpersonation,
    switchToAccount
  } = useUserManagement();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'users' | 'accounts' | 'impersonation' | 'prompts' | 'settings'>('users');
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
  
  // Prompt management state
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);

  // Check if current user is super admin
  const isCurrentUserSuperAdmin = user?.primaryEmailAddress?.emailAddress === SUPER_ADMIN_EMAIL;

  // Default AI prompts based on current implementation
  const defaultPrompts: AIPrompt[] = [
    {
      id: 'itinerary-suggestions',
      name: 'Trip Itinerary Suggestions',
      description: 'Generates personalized Disney trip itinerary suggestions based on group preferences',
      systemMessage: 'You are a Disney World vacation planning expert with extensive knowledge of all parks, attractions, dining, and logistics. Provide helpful, practical advice.',
      userPromptTemplate: `Create a personalized Disney trip itinerary suggestion for:
      
Trip Details:
- Duration: {{trip.days.length}} days
- Resort: {{trip.resort?.name || 'Not specified'}}
- Dates: {{trip.startDate}} to {{trip.endDate}}

Group Preferences:
- Group size: {{preferences.groupSize}}
- Ages: {{preferences.ages.join(', ')}}
- Interests: {{preferences.interests.join(', ')}}
- Budget: {{preferences.budget}}
- Mobility level: {{preferences.mobility}}
- Thrill preference: {{preferences.thrillLevel}}

Please provide:
1. Recommended park order for each day
2. Must-do attractions for this group
3. Dining suggestions
4. General tips and strategies
5. Special considerations for the group's needs

Keep it practical and actionable, focusing on real Disney World experiences.`,
      category: 'itinerary',
      maxTokens: 1000,
      lastModified: new Date().toISOString()
    },
    {
      id: 'day-optimization',
      name: 'Day Plan Optimization',
      description: 'Optimizes the order and timing of activities for a single park day',
      systemMessage: 'You are a Disney World logistics expert. Provide practical scheduling advice to minimize wait times and maximize enjoyment.',
      userPromptTemplate: `Optimize this Disney park day plan:

Park: {{day.park?.name || 'Not specified'}}
Current Activities: {{activities.join(', ')}}

Optimization Preferences:
- Priority: {{preferences.priority}}
- Crowd tolerance: {{preferences.crowdTolerance}}
- Walking preference: {{preferences.walkingDistance}}

Please provide:
1. Suggested order of activities
2. Estimated time for each activity
3. Practical tips for this day
4. Potential issues or warnings

Format as JSON with suggestedOrder, timeEstimates, tips, and warnings arrays.`,
      category: 'optimization',
      maxTokens: 800,
      lastModified: new Date().toISOString()
    },
    {
      id: 'dining-suggestions',
      name: 'Dining Recommendations',
      description: 'Suggests Disney World dining options based on preferences and requirements',
      systemMessage: 'You are a Disney World dining expert with knowledge of all restaurants, menus, and reservation strategies.',
      userPromptTemplate: `Suggest Disney World dining options for:
      
Preferences:
- Park: {{preferences.park || 'Any park'}}
- Meal type: {{preferences.mealType}}
- Budget: {{preferences.budget}}
- Dietary restrictions: {{preferences.dietaryRestrictions?.join(', ') || 'None'}}
- Group size: {{preferences.groupSize}}
- Special occasions: {{preferences.specialOccasion || 'None'}}

Provide 3-5 specific restaurant recommendations with reasons why they fit the criteria.`,
      category: 'dining',
      maxTokens: 600,
      lastModified: new Date().toISOString()
    },
    {
      id: 'ride-suggestions',
      name: 'Attraction Recommendations',
      description: 'Recommends Disney World attractions based on group preferences and thrill levels',
      systemMessage: 'You are a Disney World attractions expert with knowledge of wait times, Lightning Lane strategies, and guest experiences.',
      userPromptTemplate: `Suggest Disney World attractions for:
      
Preferences:
- Park: {{preferences.park || 'Any park'}}
- Thrill level: {{preferences.thrillLevel}}
- Ages in group: {{preferences.ages?.join(', ') || 'Not specified'}}
- Interests: {{preferences.interests?.join(', ') || 'General'}}
- Time available: {{preferences.timeAvailable || 'Full day'}}

Recommend 5-8 attractions with timing strategies and Lightning Lane recommendations.`,
      category: 'rides',
      maxTokens: 600,
      lastModified: new Date().toISOString()
    },
    {
      id: 'trip-summary',
      name: 'Trip Summary Generator',
      description: 'Creates encouraging and helpful trip summaries highlighting what makes each trip special',
      systemMessage: 'You are an enthusiastic Disney vacation planner who creates encouraging and helpful trip summaries.',
      userPromptTemplate: `Create a friendly trip summary for this Disney vacation:

Trip: {{trip.name}}
Duration: {{trip.days.length}} days
Resort: {{trip.resort?.name || 'Not specified'}}
Total planned activities: {{totalActivities}}

Create an encouraging summary highlighting what makes this trip special and any tips for success.`,
      category: 'summary',
      maxTokens: 300,
      lastModified: new Date().toISOString()
    }
  ];

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, accountsData] = await Promise.all([
        getAllUsers(),
        getAllAccounts()
      ]);
      
      setUsers(usersData);
      setAccounts(accountsData);
      
      // Load prompts from localStorage or initialize with defaults
      const savedPrompts = localStorage.getItem('ai-prompts');
      if (savedPrompts) {
        setPrompts(JSON.parse(savedPrompts));
      } else {
        setPrompts(defaultPrompts);
        localStorage.setItem('ai-prompts', JSON.stringify(defaultPrompts));
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [getAllUsers, getAllAccounts]);

  useEffect(() => {
    if (isCurrentUserSuperAdmin) {
      loadAdminData();
    }
  }, [isCurrentUserSuperAdmin]); // Remove loadAdminData from dependencies to prevent infinite loops

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

  // Prompt management functions
  const savePrompts = (updatedPrompts: AIPrompt[]) => {
    localStorage.setItem('ai-prompts', JSON.stringify(updatedPrompts));
    setPrompts(updatedPrompts);
  };

  const handleEditPrompt = (prompt: AIPrompt) => {
    setEditingPrompt({ ...prompt });
    setShowPromptEditor(true);
  };

  const handleSavePrompt = () => {
    if (!editingPrompt) return;

    const updatedPrompts = prompts.map(p => 
      p.id === editingPrompt.id 
        ? { ...editingPrompt, lastModified: new Date().toISOString() }
        : p
    );
    
    savePrompts(updatedPrompts);
    setShowPromptEditor(false);
    setEditingPrompt(null);
    alert('Prompt saved successfully!');
  };

  const handleResetPrompt = (promptId: string) => {
    if (window.confirm('Are you sure you want to reset this prompt to its default values? This cannot be undone.')) {
      const defaultPrompt = defaultPrompts.find(p => p.id === promptId);
      if (defaultPrompt) {
        const updatedPrompts = prompts.map(p => 
          p.id === promptId 
            ? { ...defaultPrompt, lastModified: new Date().toISOString() }
            : p
        );
        savePrompts(updatedPrompts);
        alert('Prompt reset to default successfully!');
      }
    }
  };

  const handleResetAllPrompts = () => {
    if (window.confirm('Are you sure you want to reset ALL prompts to their default values? This cannot be undone.')) {
      const resetPrompts = defaultPrompts.map(p => ({ ...p, lastModified: new Date().toISOString() }));
      savePrompts(resetPrompts);
      alert('All prompts reset to defaults successfully!');
    }
  };

  const getCategoryColor = (category: AIPrompt['category']) => {
    switch (category) {
      case 'itinerary': return 'bg-blue-100 text-blue-800';
      case 'optimization': return 'bg-green-100 text-green-800';
      case 'dining': return 'bg-orange-100 text-orange-800';
      case 'rides': return 'bg-purple-100 text-purple-800';
      case 'summary': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            { id: 'prompts', label: 'AI Prompts', icon: MessageSquare },
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

          {/* AI Prompts Tab */}
          {activeTab === 'prompts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">AI Prompt Management</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage and customize AI prompts used throughout the application
                  </p>
                </div>
                <button
                  onClick={handleResetAllPrompts}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RotateCcw size={16} />
                  <span>Reset All to Defaults</span>
                </button>
              </div>

              <div className="grid gap-6">
                {prompts.map((prompt) => (
                  <div key={prompt.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{prompt.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(prompt.category)}`}>
                            {prompt.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Max Tokens: {prompt.maxTokens}</span>
                          <span>Last Modified: {new Date(prompt.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPrompt(prompt)}
                          className="flex items-center space-x-1 px-3 py-1 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleResetPrompt(prompt.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          <RotateCcw size={14} />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">System Message</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 font-mono">{prompt.systemMessage}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">User Prompt Template</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap overflow-x-auto">{prompt.userPromptTemplate}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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

      {/* Prompt Editor Modal */}
      {showPromptEditor && editingPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit AI Prompt: {editingPrompt.name}</h3>
              <button
                onClick={() => setShowPromptEditor(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prompt Name
                </label>
                <input
                  type="text"
                  value={editingPrompt.name}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingPrompt.description}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingPrompt.category}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, category: e.target.value as AIPrompt['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                  >
                    <option value="itinerary">Itinerary</option>
                    <option value="optimization">Optimization</option>
                    <option value="dining">Dining</option>
                    <option value="rides">Rides</option>
                    <option value="summary">Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    value={editingPrompt.maxTokens}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, maxTokens: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Message
                </label>
                <textarea
                  value={editingPrompt.systemMessage}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, systemMessage: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent font-mono text-sm"
                  placeholder="Define the AI's role and expertise..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Prompt Template
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Use {`{{variable}}`} syntax for dynamic values (e.g., {`{{trip.name}}`}, {`{{preferences.budget}}`})
                </div>
                <textarea
                  value={editingPrompt.userPromptTemplate}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, userPromptTemplate: e.target.value })}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent font-mono text-sm"
                  placeholder="Enter the prompt template with {{variable}} placeholders..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <MessageSquare className="text-blue-500 mt-0.5" size={16} />
                  <div className="ml-2">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Changes to prompts will affect all future AI responses. 
                      Use the template variable syntax {`{{variable}}`} to insert dynamic data from the application.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPromptEditor(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrompt}
                  className="flex-1 px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 