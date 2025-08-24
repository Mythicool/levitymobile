/**
 * Profile Screen
 * Complete user profile management with settings and points history
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';

import {useAuth} from '../contexts/AuthContext';
import {theme} from '../constants/theme';
import {offlineStorage, PointsEntry, AppSettings} from '../services/offlineStorage';

const ProfileScreen: React.FC = () => {
  const {user, logout} = useAuth();
  const [pointsHistory, setPointsHistory] = useState<PointsEntry[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    notifications: true,
    hapticFeedback: true,
    autoSync: true,
    theme: 'auto',
  });
  const [storageInfo, setStorageInfo] = useState({
    userDataSize: 0,
    pendingCheckIns: 0,
    pointsHistoryEntries: 0,
    lastSync: null as Date | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [history, settings, storage] = await Promise.all([
        offlineStorage.getPointsHistory(),
        offlineStorage.getAppSettings(),
        offlineStorage.getStorageInfo(),
      ]);

      setPointsHistory(history);
      setAppSettings(settings);
      setStorageInfo(storage);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleSettingChange = async (key: keyof AppSettings, value: any) => {
    const newSettings = { ...appSettings, [key]: value };
    setAppSettings(newSettings);
    await offlineStorage.saveAppSettings(newSettings);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await offlineStorage.clearAllData();
            logout();
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'This will remove all offline data including points history. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await offlineStorage.clearAllData();
            await loadData();
            Alert.alert('Data Cleared', 'All offline data has been removed.');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.memberSince}>
            Member since {new Date(user.joinDate).toLocaleDateString()}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.points}</Text>
            <Text style={styles.statLabel}>Current Points</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.floor(user.points / 100)}</Text>
            <Text style={styles.statLabel}>Rewards Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pointsHistory.length}</Text>
            <Text style={styles.statLabel}>Total Transactions</Text>
          </View>
        </View>

        {/* Points History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {pointsHistory.length > 0 ? (
            <View style={styles.historyContainer}>
              {pointsHistory.slice(0, 5).map((entry, index) => (
                <View key={entry.id || index} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Text style={styles.historyIconText}>
                      {entry.type === 'earned' ? '📈' : '🎁'}
                    </Text>
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyReason}>{entry.reason}</Text>
                    <Text style={styles.historyDate}>
                      {formatDate(entry.timestamp)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.historyPoints,
                    entry.type === 'earned' ? styles.pointsEarned : styles.pointsRedeemed
                  ]}>
                    {entry.type === 'earned' ? '+' : ''}{entry.points}
                  </Text>
                </View>
              ))}
              {pointsHistory.length > 5 && (
                <Text style={styles.moreHistory}>
                  And {pointsHistory.length - 5} more transactions...
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryIcon}>📅</Text>
              <Text style={styles.emptyHistoryText}>
                No activity yet. Start earning points by checking in!
              </Text>
            </View>
          )}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Get notified about rewards and promotions
              </Text>
            </View>
            <Switch
              value={appSettings.notifications}
              onValueChange={(value) => handleSettingChange('notifications', value)}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.accent[400] }}
              thumbColor={appSettings.notifications ? theme.colors.accent[600] : theme.colors.gray[500]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>
                Feel vibrations for interactions and confirmations
              </Text>
            </View>
            <Switch
              value={appSettings.hapticFeedback}
              onValueChange={(value) => handleSettingChange('hapticFeedback', value)}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.accent[400] }}
              thumbColor={appSettings.hapticFeedback ? theme.colors.accent[600] : theme.colors.gray[500]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Auto Sync</Text>
              <Text style={styles.settingDescription}>
                Automatically sync data when connected to internet
              </Text>
            </View>
            <Switch
              value={appSettings.autoSync}
              onValueChange={(value) => handleSettingChange('autoSync', value)}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.accent[400] }}
              thumbColor={appSettings.autoSync ? theme.colors.accent[600] : theme.colors.gray[500]}
            />
          </View>
        </View>

        {/* Storage Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage & Sync</Text>

          <View style={styles.storageInfo}>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Pending Check-ins:</Text>
              <Text style={styles.storageValue}>{storageInfo.pendingCheckIns}</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Points History:</Text>
              <Text style={styles.storageValue}>{storageInfo.pointsHistoryEntries} entries</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Last Sync:</Text>
              <Text style={styles.storageValue}>
                {storageInfo.lastSync
                  ? storageInfo.lastSync.toLocaleDateString()
                  : 'Never'
                }
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.clearDataButton} onPress={handleClearData}>
            <Text style={styles.clearDataText}>Clear Offline Data</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[50],
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  userName: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.sm,
  },
  memberSince: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[500],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    flex: 0.3,
    ...theme.shadows.md,
  },
  statValue: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent[600],
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[600],
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.lg,
  },
  historyContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary[100],
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  historyIconText: {
    fontSize: 18,
  },
  historyContent: {
    flex: 1,
  },
  historyReason: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary[800],
  },
  historyDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[500],
    marginTop: theme.spacing.xs,
  },
  historyPoints: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  pointsEarned: {
    color: theme.colors.success[600],
  },
  pointsRedeemed: {
    color: theme.colors.error[600],
  },
  moreHistory: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[500],
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
  emptyHistory: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  emptyHistoryIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
    opacity: 0.5,
  },
  emptyHistoryText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[500],
    textAlign: 'center',
  },
  settingItem: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingName: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[600],
  },
  storageInfo: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  storageLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[700],
  },
  storageValue: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary[800],
  },
  clearDataButton: {
    backgroundColor: theme.colors.warning[500],
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  clearDataText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  logoutButton: {
    backgroundColor: theme.colors.error[500],
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  logoutText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default ProfileScreen;
