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
          lastLogin: new Date().toISOString(),
          status: 'active'
        });
      } else {
        // Update last login
        existingUser.lastLogin = new Date().toISOString();
        existingUser.status = 'active';
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

  const getAllUsers = async (): Promise<AppUser[]> => {
    const users = JSON.parse(localStorage.getItem('admin-users') || '[]');
    return users;
  };

  const getAllAccounts = async (): Promise<UserAccount[]> => {
    const accounts = JSON.parse(localStorage.getItem('admin-accounts') || '[]');
    return accounts;
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
      
      // Update local state if this is the current user
      if (userData.clerkId === appUser?.clerkId) {
        setAppUser(userData);
        
        // Update account if account changed
        if (userData.accountId !== appUser.accountId) {
          if (userData.accountId) {
            const account = await getUserAccount(userData.accountId);
            setUserAccount(account);
          } else {
            setUserAccount(null);
          }
        }
      }
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

  const updateUserAccount = async (accountData: UserAccount): Promise<UserAccount> => {
    const accounts = JSON.parse(localStorage.getItem('admin-accounts') || '[]');
    const accountIndex = accounts.findIndex((a: UserAccount) => a.id === accountData.id);
    
    if (accountIndex >= 0) {
      accounts[accountIndex] = {
        ...accountData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('admin-accounts', JSON.stringify(accounts));
      
      // Update local state if this is the current user's account
      if (accountData.id === userAccount?.id) {
        setUserAccount(accounts[accountIndex]);
      }
    }
    
    return accounts[accountIndex];
  };

  const assignUserToAccount = async (userId: string, accountId: string, role: 'owner' | 'admin' | 'editor' | 'viewer'): Promise<AppUser> => {
    const users = JSON.parse(localStorage.getItem('admin-users') || '[]');
    const userIndex = users.findIndex((u: AppUser) => u.clerkId === userId);
    
    if (userIndex < 0) {
      throw new Error('User not found');
    }

    // Verify account exists
    const account = await getUserAccount(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      accountId: accountId,
      role: role
    };

    localStorage.setItem('admin-users', JSON.stringify(users));
    
    // Update local state if this is the current user
    if (userId === appUser?.clerkId) {
      setAppUser(users[userIndex]);
      setUserAccount(account);
    }

    return users[userIndex];
  };

  const removeUserFromAccount = async (userId: string): Promise<AppUser> => {
    const users = JSON.parse(localStorage.getItem('admin-users') || '[]');
    const userIndex = users.findIndex((u: AppUser) => u.clerkId === userId);
    
    if (userIndex < 0) {
      throw new Error('User not found');
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      accountId: undefined,
      role: undefined
    };

    localStorage.setItem('admin-users', JSON.stringify(users));
    
    // Update local state if this is the current user
    if (userId === appUser?.clerkId) {
      setAppUser(users[userIndex]);
      setUserAccount(null);
    }

    return users[userIndex];
  };

  const getUsersInAccount = async (accountId: string): Promise<AppUser[]> => {
    const users = await getAllUsers();
    return users.filter(u => u.accountId === accountId);
  };

  const deleteAccount = async (accountId: string): Promise<void> => {
    // Remove account
    const accounts = JSON.parse(localStorage.getItem('admin-accounts') || '[]');
    const updatedAccounts = accounts.filter((a: UserAccount) => a.id !== accountId);
    localStorage.setItem('admin-accounts', JSON.stringify(updatedAccounts));

    // Remove users from account
    const users = JSON.parse(localStorage.getItem('admin-users') || '[]');
    const updatedUsers = users.map((u: AppUser) => 
      u.accountId === accountId 
        ? { ...u, accountId: undefined, role: undefined }
        : u
    );
    localStorage.setItem('admin-users', JSON.stringify(updatedUsers));

    // Update local state if current user was in this account
    if (userAccount?.id === accountId) {
      setUserAccount(null);
      if (appUser) {
        setAppUser({ ...appUser, accountId: undefined, role: undefined });
      }
    }
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

  const canManageUsers = (): boolean => {
    return isSuperAdmin() || isAccountOwner() || appUser?.role === 'admin';
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
    updateUserAccount,
    assignUserToAccount,
    removeUserFromAccount,
    getUsersInAccount,
    deleteAccount,
    getAllUsers,
    getAllAccounts,
    updateAppUser,
    
    // Permission functions
    isSuperAdmin,
    isAccountOwner,
    hasPermission,
    canAccessAdmin,
    canManageAccount,
    canManageUsers,
    needsAccount,
  };
}; 