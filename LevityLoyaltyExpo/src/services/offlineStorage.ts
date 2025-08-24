/**
 * Offline Storage Service
 * Handles local data persistence and synchronization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: 'levity_user_data',
  PENDING_CHECKINS: 'levity_pending_checkins',
  POINTS_HISTORY: 'levity_points_history',
  REDEMPTIONS: 'levity_redemptions',
  APP_SETTINGS: 'levity_app_settings',
  LAST_SYNC: 'levity_last_sync',
} as const;

// Types
interface PendingCheckIn {
  id: string;
  userId: string;
  timestamp: string;
  location?: string;
  synced: boolean;
}

interface PointsEntry {
  id: string;
  userId: string;
  points: number;
  reason: string;
  timestamp: string;
  type: 'earned' | 'redeemed';
}

interface AppSettings {
  notifications: boolean;
  hapticFeedback: boolean;
  autoSync: boolean;
  theme: 'light' | 'dark' | 'auto';
}

class OfflineStorageService {
  // User data management
  async saveUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  async getUserData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  // Pending check-ins (for offline functionality)
  async addPendingCheckIn(checkIn: Omit<PendingCheckIn, 'id'>): Promise<string> {
    try {
      const id = `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newCheckIn: PendingCheckIn = { ...checkIn, id };
      
      const existing = await this.getPendingCheckIns();
      const updated = [...existing, newCheckIn];
      
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CHECKINS, JSON.stringify(updated));
      return id;
    } catch (error) {
      console.error('Error adding pending check-in:', error);
      throw error;
    }
  }

  async getPendingCheckIns(): Promise<PendingCheckIn[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CHECKINS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending check-ins:', error);
      return [];
    }
  }

  async markCheckInSynced(checkInId: string): Promise<void> {
    try {
      const checkIns = await this.getPendingCheckIns();
      const updated = checkIns.map(checkIn => 
        checkIn.id === checkInId ? { ...checkIn, synced: true } : checkIn
      );
      
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CHECKINS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking check-in as synced:', error);
    }
  }

  async removeSyncedCheckIns(): Promise<void> {
    try {
      const checkIns = await this.getPendingCheckIns();
      const unsynced = checkIns.filter(checkIn => !checkIn.synced);
      
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CHECKINS, JSON.stringify(unsynced));
    } catch (error) {
      console.error('Error removing synced check-ins:', error);
    }
  }

  // Points history
  async savePointsHistory(history: PointsEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.POINTS_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving points history:', error);
    }
  }

  async getPointsHistory(): Promise<PointsEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.POINTS_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting points history:', error);
      return [];
    }
  }

  async addPointsEntry(entry: Omit<PointsEntry, 'id'>): Promise<void> {
    try {
      const id = `points_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newEntry: PointsEntry = { ...entry, id };
      
      const existing = await this.getPointsHistory();
      const updated = [newEntry, ...existing]; // Add to beginning for chronological order
      
      await AsyncStorage.setItem(STORAGE_KEYS.POINTS_HISTORY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding points entry:', error);
    }
  }

  // App settings
  async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  }

  async getAppSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      const defaultSettings: AppSettings = {
        notifications: true,
        hapticFeedback: true,
        autoSync: true,
        theme: 'auto',
      };
      
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch (error) {
      console.error('Error getting app settings:', error);
      return {
        notifications: true,
        hapticFeedback: true,
        autoSync: true,
        theme: 'auto',
      };
    }
  }

  // Sync management
  async updateLastSync(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Error updating last sync:', error);
    }
  }

  async getLastSync(): Promise<Date | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return data ? new Date(data) : null;
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  }

  // Clear all data (for logout)
  async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  // Get storage info (for debugging)
  async getStorageInfo(): Promise<{
    userDataSize: number;
    pendingCheckIns: number;
    pointsHistoryEntries: number;
    lastSync: Date | null;
  }> {
    try {
      const userData = await this.getUserData();
      const pendingCheckIns = await this.getPendingCheckIns();
      const pointsHistory = await this.getPointsHistory();
      const lastSync = await this.getLastSync();

      return {
        userDataSize: userData ? JSON.stringify(userData).length : 0,
        pendingCheckIns: pendingCheckIns.length,
        pointsHistoryEntries: pointsHistory.length,
        lastSync,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        userDataSize: 0,
        pendingCheckIns: 0,
        pointsHistoryEntries: 0,
        lastSync: null,
      };
    }
  }
}

export const offlineStorage = new OfflineStorageService();
export type { PendingCheckIn, PointsEntry, AppSettings };
