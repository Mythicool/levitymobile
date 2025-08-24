/**
 * Authentication Context for Levity Loyalty Mobile App
 * Adapted from the web app's AuthContext
 */

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {userService} from '../services/dataService';

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
      const result = await userService.getUserById(userId);
      if (result.success) {
        setUser(result.user);
      } else {
        // If user not found in cloud, clear local storage
        await AsyncStorage.removeItem('levity_user_id');
      }
    } catch (error) {
      console.error('Error loading user from cloud:', error);
      await AsyncStorage.removeItem('levity_user_id');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await userService.authenticateUser(email, password);

      if (result.success) {
        setUser(result.user);
        await AsyncStorage.setItem('levity_user_id', result.user.id);
        return {success: true};
      } else {
        return {success: false, error: result.error};
      }
    } catch (error) {
      return {success: false, error: (error as Error).message};
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);

      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser.success) {
        return {success: false, error: 'User with this email already exists'};
      }

      // Create new user
      const result = await userService.createUser({name, email, password});

      if (result.success) {
        const {password: _, ...userWithoutPassword} = result.user;
        setUser(userWithoutPassword);
        await AsyncStorage.setItem('levity_user_id', result.user.id);
        return {success: true};
      } else {
        return {success: false, error: result.error};
      }
    } catch (error) {
      return {success: false, error: (error as Error).message};
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('levity_user_id');
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (!user) return {success: false, error: 'No user logged in'};

      const result = await userService.updateUser(user.id, updates);
      if (result.success) {
        setUser(result.user);
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
      const result = await userService.getUserById(user.id);
      if (result.success) {
        setUser(result.user);
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
