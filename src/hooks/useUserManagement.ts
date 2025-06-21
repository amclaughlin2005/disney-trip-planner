import { useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { AppUser, UserAccount, USER_ROLES } from '../types';

// Replace with your actual super admin email
const SUPER_ADMIN_EMAIL = 'amclaughlin2005@gmail.com';

export const useUserManagement = () => {
  const { user, isLoaded } = useUser();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      initializeUser();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [isLoaded, user]);

  const initializeUser = async () => {
    if (!user) return;

    try {
      // Check if user exists in our system
      let existingUser = await getAppUser(user.id);
      
      if (!existingUser) {
        // Create new app user
        existingUser = await createAppUser({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          name: user.fullName || user.primaryEmailAddress?.emailAddress || 'Unknown',
          isSuperAdmin: user.primaryEmailAddress?.emailAddress === SUPER_ADMIN_EMAIL,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        // Update last login
        existingUser.lastLogin = new Date().toISOString();
        await updateAppUser(existingUser);
      }

      setAppUser(existingUser);

      // Load user's account if they have one
      if (existingUser.accountId) {
        const account = await getUserAccount(existingUser.accountId);
        setUserAccount(account);
      }

    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulated API functions - replace with actual API calls
  const getAppUser = async (clerkId: string): Promise<AppUser | null> => {
    const users = JSON.parse(localStorage.getItem('admin-users') || '[]');
    return users.find((u: AppUser) => u.clerkId === clerkId) || null;
  };

  const createAppUser = async (userData: Omit<AppUser, 'accountId' | 'role'>): Promise<AppUser> => {
    const users = JSON.parse(localStorage.getItem('admin-users') || '[]');
    const newUser: AppUser = {
      ...userData,
      accountId: undefined,
      role: undefined
    };
    
    users.push(newUser);
    localStorage.setItem('admin-users', JSON.stringify(users));
    return newUser;
  };

  const updateAppUser = async (userData: AppUser): Promise<AppUser> => {
    const users = JSON.parse(localStorage.getItem('admin-users') || '[]');
    const userIndex = users.findIndex((u: AppUser) => u.clerkId === userData.clerkId);
    
    if (userIndex >= 0) {
      users[userIndex] = userData;
      localStorage.setItem('admin-users', JSON.stringify(users));
    }
    
    return userData;
  };

  const getUserAccount = async (accountId: string): Promise<UserAccount | null> => {
    const accounts = JSON.parse(localStorage.getItem('admin-accounts') || '[]');
    return accounts.find((a: UserAccount) => a.id === accountId) || null;
  };

  const createUserAccount = async (accountName: string): Promise<UserAccount> => {
    if (!user || !appUser) throw new Error('User not authenticated');

    const accounts = JSON.parse(localStorage.getItem('admin-accounts') || '[]');
    const newAccount: UserAccount = {
      id: `account-${Date.now()}`,
      name: accountName,
      ownerId: user.id,
      subscriptionStatus: 'trial',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    accounts.push(newAccount);
    localStorage.setItem('admin-accounts', JSON.stringify(accounts));

    // Update user to be owner of this account
    const updatedUser: AppUser = {
      ...appUser,
      accountId: newAccount.id,
      role: 'owner'
    };

    await updateAppUser(updatedUser);
    setAppUser(updatedUser);
    setUserAccount(newAccount);

    return newAccount;
  };

  // Permission checking functions
  const isSuperAdmin = (): boolean => {
    return appUser?.isSuperAdmin || false;
  };

  const isAccountOwner = (): boolean => {
    return appUser?.role === 'owner';
  };

  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin()) return true;
    
    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      owner: ['trips:create', 'trips:read', 'trips:update', 'trips:delete', 'users:create', 'users:read', 'users:update', 'users:delete', 'billing:read', 'billing:update', 'settings:read', 'settings:update'],
      admin: ['trips:create', 'trips:read', 'trips:update', 'trips:delete', 'users:read', 'settings:read'],
      editor: ['trips:create', 'trips:read', 'trips:update', 'trips:delete'],
      viewer: ['trips:read']
    };

    const userRole = appUser?.role;
    if (!userRole) return false;

    return rolePermissions[userRole]?.includes(permission) || false;
  };

  const canAccessAdmin = (): boolean => {
    return isSuperAdmin();
  };

  const canManageAccount = (): boolean => {
    return isSuperAdmin() || isAccountOwner();
  };

  const needsAccount = (): boolean => {
    return !isSuperAdmin() && !appUser?.accountId;
  };

  return {
    user,
    appUser,
    userAccount,
    loading,
    isLoaded,
    
    // User management functions
    createUserAccount,
    
    // Permission functions
    isSuperAdmin,
    isAccountOwner,
    hasPermission,
    canAccessAdmin,
    canManageAccount,
    needsAccount,
  };
}; 