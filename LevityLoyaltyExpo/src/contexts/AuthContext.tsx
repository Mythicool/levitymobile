/**
 * Authentication Context for Levity Loyalty Mobile App
 * Adapted from the web app's AuthContext
 */

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, userService, isUsingProductionDB, getServiceInfo } from '../services/dataServiceAdapter';
import { offlineStorage } from '../services/offlineStorage';

// Fallback mock user service for demo (when production DB is not available)
const mockUserService = {
  async authenticateUser(email: string, password: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'demo@levity.com' && password === 'demo123') {
      return {
        success: true,
        user: {
          id: '1',
          email: 'demo@levity.com',
          name: 'Demo User',
          points: 150,
          joinDate: new Date().toISOString(),
          isActive: true,
        }
      };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  async createUser(userData: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      user: {
        id: '2',
        email: userData.email,
        name: userData.name,
        points: 0,
        joinDate: new Date().toISOString(),
        isActive: true,
      }
    };
  },

  async getUserByEmail(email: string) {
    return { success: false, error: 'User not found' };
  },

  async getUserById(userId: string) {
    return {
      success: true,
      user: {
        id: userId,
        email: 'demo@levity.com',
        name: 'Demo User',
        points: 150,
        joinDate: new Date().toISOString(),
        isActive: true,
      }
    };
  },

  async updateUser(userId: string, updates: any) {
    return {
      success: true,
      user: {
        id: userId,
        email: 'demo@levity.com',
        name: 'Demo User',
        points: updates.points || 150,
        joinDate: new Date().toISOString(),
        isActive: true,
        ...updates,
      }
    };
  },
};

interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  joinDate: string;
  lastCheckIn?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  register: (name: string, email: string, password: string) => Promise<{success: boolean; error?: string}>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<{success: boolean; error?: string}>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const savedUserId = await AsyncStorage.getItem('levity_user_id');
      if (savedUserId) {
        // Try to load user from backend
        await loadUserFromCloud(savedUserId);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFromCloud = async (userId: string) => {
    try {
      // Use production service if available, otherwise fallback to mock
      const service = isUsingProductionDB() ? authService : mockUserService;

      let result;
      if (isUsingProductionDB()) {
        result = await authService.getCurrentUser();
      } else {
        result = await mockUserService.getUserById(userId);
      }

      if (result.success) {
        setUser(result.data || result.user);
        // Save user data to offline storage
        await offlineStorage.saveUserData(result.data || result.user);
      } else {
        // If user not found in cloud, clear local storage
        await AsyncStorage.removeItem('levity_user_id');
        await offlineStorage.clearUserData();
      }
    } catch (error) {
      console.error('Error loading user from cloud:', error);
      await AsyncStorage.removeItem('levity_user_id');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Use production service if available, otherwise fallback to mock
      const service = isUsingProductionDB() ? authService : mockUserService;

      let result;
      if (isUsingProductionDB()) {
        result = await authService.signIn(email, password);
      } else {
        result = await mockUserService.authenticateUser(email, password);
      }

      if (result.success) {
        const userData = result.data || result.user;
        setUser(userData);
        await AsyncStorage.setItem('levity_user_id', userData.id);

        // Save user data to offline storage
        await offlineStorage.saveUserData(userData);

        console.log(`Logged in with ${isUsingProductionDB() ? 'Supabase' : 'Mock'} service:`, getServiceInfo());
        return {success: true};
      } else {
        return {success: false, error: result.error};
      }
    } catch (error) {
      console.error('Login error:', error);
      return {success: false, error: (error as Error).message};
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);

      // Use production service if available, otherwise fallback to mock
      if (isUsingProductionDB()) {
        const result = await authService.signUp({name, email, password});

        if (result.success) {
          const userData = result.data;
          setUser(userData);
          await AsyncStorage.setItem('levity_user_id', userData.id);

          // Save user data to offline storage
          await offlineStorage.saveUserData(userData);

          console.log('Registered with Supabase service:', getServiceInfo());
          return {success: true};
        } else {
          return {success: false, error: result.error};
        }
      } else {
        // Check if user already exists (mock service)
        const existingUser = await mockUserService.getUserByEmail(email);
        if (existingUser.success) {
          return {success: false, error: 'User with this email already exists'};
        }

        // Create new user with mock service
        const result = await mockUserService.createUser({name, email, password});

        if (result.success) {
          const {password: _, ...userWithoutPassword} = result.user;
          setUser(userWithoutPassword);
          await AsyncStorage.setItem('levity_user_id', result.user.id);

          // Save user data to offline storage
          await offlineStorage.saveUserData(userWithoutPassword);

          console.log('Registered with Mock service:', getServiceInfo());
          return {success: true};
        } else {
          return {success: false, error: result.error};
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {success: false, error: (error as Error).message};
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Sign out from production service if available
      if (isUsingProductionDB()) {
        await authService.signOut();
      }

      setUser(null);
      await AsyncStorage.removeItem('levity_user_id');
      await offlineStorage.clearUserData();

      console.log('Logged out from', isUsingProductionDB() ? 'Supabase' : 'Mock', 'service');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if remote logout fails
      setUser(null);
      await AsyncStorage.removeItem('levity_user_id');
      await offlineStorage.clearUserData();
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (!user) return {success: false, error: 'No user logged in'};

      let result;
      if (isUsingProductionDB()) {
        result = await userService.updateUser(user.id, updates);
      } else {
        result = await mockUserService.updateUser(user.id, updates);
      }

      if (result.success) {
        const userData = result.data || result.user;
        setUser(userData);
        await offlineStorage.saveUserData(userData);
        return {success: true};
      } else {
        return {success: false, error: result.error};
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return {success: false, error: (error as Error).message};
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      let result;
      if (isUsingProductionDB()) {
        result = await userService.getUserById(user.id);
      } else {
        result = await mockUserService.getUserById(user.id);
      }

      if (result.success) {
        const userData = result.data || result.user;
        setUser(userData);
        await offlineStorage.saveUserData(userData);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
