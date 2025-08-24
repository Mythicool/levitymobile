/**
 * Supabase Configuration
 * Production-ready PostgreSQL database with authentication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Improved session handling for cross-device scenarios
    flowType: 'pkce', // Use PKCE flow for better security
    debug: process.env.NODE_ENV === 'development', // Enable debug logging in development
  },
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'levity-loyalty-mobile',
    },
  },
});

// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  join_date: string;
  last_check_in?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  type: 'earned' | 'redeemed';
  created_at: string;
  metadata?: Record<string, any>;
}

export interface CheckIn {
  id: string;
  user_id: string;
  location?: string;
  points_earned: number;
  created_at: string;
}

export interface Redemption {
  id: string;
  user_id: string;
  reward_id: string;
  reward_name: string;
  points_cost: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notifications: boolean;
  haptic_feedback: boolean;
  auto_sync: boolean;
  theme: 'light' | 'dark' | 'auto';
  created_at: string;
  updated_at: string;
}

// Utility function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key'
  );
};

// Health check function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

// Session management helpers
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Session check failed:', error);
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('User check failed:', error);
    return null;
  }
};

// Auth state change listener
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Database helper functions
export const executeQuery = async (query: any) => {
  try {
    const result = await query;
    return result;
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
};

// Real-time subscription helpers
export const subscribeToTable = (
  table: string, 
  callback: (payload: any) => void,
  filter?: string
) => {
  const subscription = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: table,
        filter: filter 
      },
      callback
    )
    .subscribe();

  return subscription;
};

// Cleanup function
export const cleanup = async () => {
  try {
    await supabase.removeAllChannels();
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
};

export default supabase;
