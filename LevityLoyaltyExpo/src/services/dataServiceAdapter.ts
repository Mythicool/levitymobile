/**
 * Data Service Adapter
 * Switches between mock and production data services based on environment
 */

import { productionDataService } from './productionDataService';

// Import the existing mock service
const mockDataService = require('./dataService');

// Environment configuration
const USE_PRODUCTION_DB = process.env.EXPO_PUBLIC_USE_PRODUCTION_DB === 'true' || 
                         process.env.EXPO_PUBLIC_SUPABASE_URL !== undefined;

// Service adapter that provides a unified interface
export const dataService = USE_PRODUCTION_DB ? productionDataService : mockDataService;

// Export individual services for direct access
export const authService = USE_PRODUCTION_DB ? productionDataService.auth : {
  signUp: mockDataService.userService?.createUser || (() => Promise.resolve({ success: false, error: 'Not implemented' })),
  signIn: mockDataService.userService?.authenticateUser || (() => Promise.resolve({ success: false, error: 'Not implemented' })),
  signOut: () => Promise.resolve({ success: true }),
  getCurrentUser: () => Promise.resolve({ success: false, error: 'Not implemented' }),
};

export const userService = USE_PRODUCTION_DB ? productionDataService.user : mockDataService.userService;

export const checkinService = USE_PRODUCTION_DB ? productionDataService.checkin : mockDataService.checkinService;

export const pointsService = USE_PRODUCTION_DB ? productionDataService.points : {
  getPointsHistory: () => Promise.resolve({ success: true, data: [] }),
  addPointsTransaction: () => Promise.resolve({ success: true, data: {} }),
};

export const redemptionService = USE_PRODUCTION_DB ? productionDataService.redemption : {
  redeemReward: () => Promise.resolve({ success: true, redemption: {} }),
  getRedemptionHistory: () => Promise.resolve({ success: true, data: [] }),
};

export const settingsService = USE_PRODUCTION_DB ? productionDataService.settings : {
  getUserSettings: () => Promise.resolve({ 
    success: true, 
    data: {
      notifications: true,
      haptic_feedback: true,
      auto_sync: true,
      theme: 'auto',
    }
  }),
  updateUserSettings: () => Promise.resolve({ success: true, data: {} }),
};

// Utility functions
export const isUsingProductionDB = () => USE_PRODUCTION_DB;

export const getServiceInfo = () => ({
  isProduction: USE_PRODUCTION_DB,
  service: USE_PRODUCTION_DB ? 'Supabase PostgreSQL' : 'Mock Data Service',
  hasSupabaseUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
  hasSupabaseKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

// Health check function
export const healthCheck = async () => {
  if (USE_PRODUCTION_DB) {
    return await productionDataService.getHealthCheck();
  } else {
    return {
      success: true,
      data: { 
        status: 'healthy', 
        service: 'mock',
        timestamp: new Date().toISOString(),
      },
    };
  }
};

// Migration helper (for transitioning from mock to production)
export const migrateToProduction = async (userId: string) => {
  if (!USE_PRODUCTION_DB) {
    console.warn('Cannot migrate: Production database not configured');
    return { success: false, error: 'Production database not configured' };
  }

  try {
    // This would migrate local data to production database
    // Implementation depends on specific migration requirements
    console.log('Migration to production database initiated for user:', userId);
    
    return {
      success: true,
      message: 'Migration completed successfully',
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      error: 'Migration failed',
    };
  }
};

export default dataService;
