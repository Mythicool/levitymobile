/**
 * Production Data Service for Levity Loyalty Mobile App
 * Supabase PostgreSQL backend with authentication
 */

import { supabase, User, PointsTransaction, CheckIn, Redemption, UserSettings } from './supabase';
import { AuthError, PostgrestError } from '@supabase/supabase-js';

// Helper function to handle Supabase errors
const handleSupabaseError = (error: AuthError | PostgrestError | null, defaultMessage: string) => {
  if (!error) return null;
  
  console.error('Supabase error:', error);
  
  // Handle specific error types
  if (error.message.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (error.message.includes('User already registered')) {
    return 'An account with this email already exists';
  }
  if (error.message.includes('Email not confirmed')) {
    return 'Please check your email and confirm your account';
  }
  
  return error.message || defaultMessage;
};

// Types for API responses
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
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
  redemption?: Redemption;
  error?: string;
}

// Authentication Service
export const authService = {
  async signUp(userData: CreateUserData): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: handleSupabaseError(error, 'Failed to create account'),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Failed to create user account',
        };
      }

      // Get the created user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }

      return {
        success: true,
        data: userProfile || {
          id: data.user.id,
          email: userData.email,
          name: userData.name,
          points: 0,
          join_date: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during sign up',
      };
    }
  },

  async signIn(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: handleSupabaseError(error, 'Failed to sign in'),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Invalid login credentials',
        };
      }

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return {
          success: false,
          error: 'Failed to load user profile',
        };
      }

      return {
        success: true,
        data: userProfile,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during sign in',
      };
    }
  },

  async signOut(): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: handleSupabaseError(error, 'Failed to sign out'),
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during sign out',
      };
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return {
          success: false,
          error: 'No authenticated user found',
        };
      }

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return {
          success: false,
          error: 'Failed to load user profile',
        };
      }

      return {
        success: true,
        data: userProfile,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: 'Failed to get current user',
      };
    }
  },
};

// User Service
export const userService = {
  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    return authService.signUp(userData);
  },

  async authenticateUser(email: string, password: string): Promise<ApiResponse<User>> {
    return authService.signIn(email, password);
  },

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return {
          success: false,
          error: handleSupabaseError(error, 'User not found'),
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return {
        success: false,
        error: 'Failed to get user',
      };
    }
  },

  async getUserByEmail(email: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Get user by email error:', error);
      return {
        success: false,
        error: 'Failed to get user',
      };
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: handleSupabaseError(error, 'Failed to update user'),
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: 'Failed to update user',
      };
    }
  },
};

// Check-in Service
export const checkinService = {
  async checkIn(userId: string, location?: string): Promise<CheckInResult> {
    try {
      // Check if user already checked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: existingCheckIn, error: checkError } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .single();

      if (existingCheckIn) {
        return {
          success: false,
          error: 'You have already checked in today',
        };
      }

      // Calculate points (base 10 points, bonus for consecutive days)
      const pointsEarned = 10; // Can be enhanced with streak bonuses

      // Create check-in record
      const { data: checkIn, error: insertError } = await supabase
        .from('check_ins')
        .insert({
          user_id: userId,
          location,
          points_earned: pointsEarned,
        })
        .select()
        .single();

      if (insertError) {
        return {
          success: false,
          error: handleSupabaseError(insertError, 'Failed to record check-in'),
        };
      }

      // Update user points using the database function
      const { error: pointsError } = await supabase.rpc('update_user_points', {
        p_user_id: userId,
        p_points: pointsEarned,
        p_reason: 'Daily check-in',
        p_type: 'earned',
      });

      if (pointsError) {
        console.error('Error updating points:', pointsError);
        return {
          success: false,
          error: 'Check-in recorded but failed to update points',
        };
      }

      // Update last check-in timestamp
      await supabase
        .from('users')
        .update({
          last_check_in: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return {
        success: true,
        pointsEntry: {
          points: pointsEarned,
          reason: 'Daily check-in',
        },
      };
    } catch (error) {
      console.error('Check-in error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during check-in',
      };
    }
  },

  async getCheckInHistory(userId: string, limit = 50): Promise<ApiResponse<CheckIn[]>> {
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: handleSupabaseError(error, 'Failed to get check-in history'),
        };
      }

      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      console.error('Get check-in history error:', error);
      return {
        success: false,
        error: 'Failed to get check-in history',
      };
    }
  },

  async canCheckIn(userId: string): Promise<ApiResponse<{ canCheckIn: boolean }>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: existingCheckIn, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .single();

      return {
        success: true,
        data: { canCheckIn: !existingCheckIn },
      };
    } catch (error) {
      console.error('Can check-in error:', error);
      return {
        success: false,
        error: 'Failed to check check-in status',
      };
    }
  },
};

// Points Service
export const pointsService = {
  async getPointsHistory(userId: string, limit = 50): Promise<ApiResponse<PointsTransaction[]>> {
    try {
      const { data, error } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: handleSupabaseError(error, 'Failed to get points history'),
        };
      }

      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      console.error('Get points history error:', error);
      return {
        success: false,
        error: 'Failed to get points history',
      };
    }
  },

  async addPointsTransaction(
    userId: string,
    points: number,
    reason: string,
    type: 'earned' | 'redeemed',
    metadata?: Record<string, any>
  ): Promise<ApiResponse<PointsTransaction>> {
    try {
      const { data, error } = await supabase
        .from('points_transactions')
        .insert({
          user_id: userId,
          points,
          reason,
          type,
          metadata,
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: handleSupabaseError(error, 'Failed to add points transaction'),
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Add points transaction error:', error);
      return {
        success: false,
        error: 'Failed to add points transaction',
      };
    }
  },
};

// Redemption Service
export const redemptionService = {
  async redeemReward(
    userId: string,
    rewardId: string,
    rewardName: string,
    pointsCost: number
  ): Promise<RedemptionResult> {
    try {
      // Check if user has enough points
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return {
          success: false,
          error: 'Failed to verify user points',
        };
      }

      if (user.points < pointsCost) {
        return {
          success: false,
          error: 'Insufficient points for this reward',
        };
      }

      // Create redemption record
      const { data: redemption, error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          user_id: userId,
          reward_id: rewardId,
          reward_name: rewardName,
          points_cost: pointsCost,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (redemptionError) {
        return {
          success: false,
          error: handleSupabaseError(redemptionError, 'Failed to create redemption'),
        };
      }

      // Deduct points using the database function
      const { error: pointsError } = await supabase.rpc('update_user_points', {
        p_user_id: userId,
        p_points: -pointsCost,
        p_reason: `Redeemed: ${rewardName}`,
        p_type: 'redeemed',
      });

      if (pointsError) {
        console.error('Error updating points:', pointsError);
        return {
          success: false,
          error: 'Redemption created but failed to deduct points',
        };
      }

      return {
        success: true,
        redemption,
      };
    } catch (error) {
      console.error('Redeem reward error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during redemption',
      };
    }
  },

  async getRedemptionHistory(userId: string, limit = 50): Promise<ApiResponse<Redemption[]>> {
    try {
      const { data, error } = await supabase
        .from('redemptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: handleSupabaseError(error, 'Failed to get redemption history'),
        };
      }

      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      console.error('Get redemption history error:', error);
      return {
        success: false,
        error: 'Failed to get redemption history',
      };
    }
  },
};

// Settings Service
export const settingsService = {
  async getUserSettings(userId: string): Promise<ApiResponse<UserSettings>> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no settings exist, create default settings
        if (error.code === 'PGRST116') {
          const defaultSettings = {
            user_id: userId,
            notifications: true,
            haptic_feedback: true,
            auto_sync: true,
            theme: 'auto' as const,
          };

          const { data: newSettings, error: createError } = await supabase
            .from('user_settings')
            .insert(defaultSettings)
            .select()
            .single();

          if (createError) {
            return {
              success: false,
              error: handleSupabaseError(createError, 'Failed to create user settings'),
            };
          }

          return {
            success: true,
            data: newSettings,
          };
        }

        return {
          success: false,
          error: handleSupabaseError(error, 'Failed to get user settings'),
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Get user settings error:', error);
      return {
        success: false,
        error: 'Failed to get user settings',
      };
    }
  },

  async updateUserSettings(
    userId: string,
    settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<ApiResponse<UserSettings>> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: handleSupabaseError(error, 'Failed to update user settings'),
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Update user settings error:', error);
      return {
        success: false,
        error: 'Failed to update user settings',
      };
    }
  },
};

// Main Production Data Service
export const productionDataService = {
  // Authentication
  auth: authService,

  // User management
  user: userService,

  // Check-ins
  checkin: checkinService,

  // Points
  points: pointsService,

  // Redemptions
  redemption: redemptionService,

  // Settings
  settings: settingsService,

  // Utility methods
  async isConnected(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  },

  async getHealthCheck(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);

      if (error) {
        return {
          success: false,
          error: 'Database connection failed',
        };
      }

      return {
        success: true,
        data: { status: 'healthy', timestamp: new Date().toISOString() },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Health check failed',
      };
    }
  },
};

export default productionDataService;
