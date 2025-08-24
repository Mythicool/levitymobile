/**
 * Data Service for Levity Loyalty Mobile App
 * Handles API communication with the backend
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' // Development
  : 'https://your-production-api.com/api'; // Production

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      await AsyncStorage.multiRemove(['auth_token', 'levity_user_id']);
    }
    return Promise.reject(error);
  }
);

// Types
interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  points: number;
  joinDate: string;
  lastCheckIn?: string;
  isActive: boolean;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

interface CheckInResult {
  success: boolean;
  pointsEntry?: {
    points: number;
    reason: string;
  };
  error?: string;
}

interface RedemptionResult {
  success: boolean;
  redemption?: any;
  error?: string;
}

// User Service
export const userService = {
  async createUser(userData: CreateUserData) {
    try {
      const response = await api.post('/users', userData);
      return { success: true, user: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create user' 
      };
    }
  },

  async authenticateUser(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      // Store auth token
      await AsyncStorage.setItem('auth_token', token);
      
      return { success: true, user };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Authentication failed' 
      };
    }
  },

  async getUserById(userId: string) {
    try {
      const response = await api.get(`/users/${userId}`);
      return { success: true, user: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get user' 
      };
    }
  },

  async getUserByEmail(email: string) {
    try {
      const response = await api.get(`/users/email/${email}`);
      return { success: true, user: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'User not found' 
      };
    }
  },

  async updateUser(userId: string, updates: Partial<User>) {
    try {
      const response = await api.put(`/users/${userId}`, updates);
      return { success: true, user: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update user' 
      };
    }
  },
};

// Check-in Service
export const checkinService = {
  async canCheckIn(userId: string) {
    try {
      const response = await api.get(`/checkins/can-checkin/${userId}`);
      return { success: true, canCheckIn: response.data.canCheckIn };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to check check-in status' 
      };
    }
  },

  async checkIn(userId: string): Promise<CheckInResult> {
    try {
      const response = await api.post('/checkins', { userId });
      return { 
        success: true, 
        pointsEntry: response.data.pointsEntry 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Check-in failed' 
      };
    }
  },
};

// Redemptions Service
export const redemptionsService = {
  async redeemReward(
    userId: string, 
    rewardId: string, 
    pointsCost: number, 
    rewardName: string
  ): Promise<RedemptionResult> {
    try {
      const response = await api.post('/redemptions', {
        userId,
        rewardId,
        pointsCost,
        rewardName,
      });
      return { 
        success: true, 
        redemption: response.data 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Redemption failed' 
      };
    }
  },

  async getUserRedemptions(userId: string) {
    try {
      const response = await api.get(`/redemptions/user/${userId}`);
      return { success: true, redemptions: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get redemptions' 
      };
    }
  },
};

// Points Service
export const pointsService = {
  async getPointsHistory(userId: string) {
    try {
      const response = await api.get(`/points/history/${userId}`);
      return { success: true, history: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get points history' 
      };
    }
  },
};
