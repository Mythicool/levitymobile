/**
 * Dashboard Screen
 * Adapted from the web app's Dashboard component
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

import {useAuth} from '../contexts/AuthContext';
import {theme} from '../constants/theme';
import {MainTabParamList} from '../navigation/MainNavigator';

type DashboardScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const {user} = useAuth();

  if (!user) {
    return null;
  }

  // Calculate progress to next reward (every 100 points)
  const pointsToNextReward = 100 - (user.points % 100);
  const progressPercentage = ((user.points % 100) / 100) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user.name}!</Text>
          <Text style={styles.memberText}>
            Member since {new Date(user.joinDate).toLocaleDateString()}
          </Text>
        </View>

        {/* Points Display */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsValue}>{user.points}</Text>
          <Text style={styles.pointsLabel}>Total Points</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('CheckIn')}>
            <Text style={styles.actionIcon}>📱</Text>
            <Text style={styles.actionTitle}>Check In</Text>
            <Text style={styles.actionSubtitle}>Scan QR code to earn points</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Rewards')}>
            <Text style={styles.actionIcon}>🎁</Text>
            <Text style={styles.actionTitle}>View Rewards</Text>
            <Text style={styles.actionSubtitle}>See what you can redeem</Text>
          </TouchableOpacity>
        </View>

        {/* Progress to Next Reward */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress to Next Reward</Text>
            <Text style={styles.progressSubtitle}>{pointsToNextReward} points to go</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
          </View>
          
          <Text style={styles.progressText}>
            You're {progressPercentage.toFixed(0)}% of the way to your next 100-point reward!
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Total Visits</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎁</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Rewards Redeemed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{Math.floor(user.points / 100)}</Text>
            <Text style={styles.statLabel}>Rewards Earned</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>☕</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityName}>Welcome Bonus</Text>
              <Text style={styles.activityDate}>
                {new Date(user.joinDate).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.activityPoints}>+0 points</Text>
          </View>
          
          <View style={styles.emptyActivity}>
            <Text style={styles.emptyActivityIcon}>📅</Text>
            <Text style={styles.emptyActivityText}>
              No recent visits yet. Check in at Levity to start earning points!
            </Text>
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  welcomeText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary[600],
  },
  nameText: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.sm,
  },
  memberText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[600],
  },
  pointsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  pointsValue: {
    fontSize: theme.fontSize['4xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent[600],
  },
  pointsLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[600],
    marginTop: theme.spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  actionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    flex: 0.48,
    ...theme.shadows.md,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.md,
  },
  actionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.sm,
  },
  actionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[600],
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  progressTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary[800],
  },
  progressSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[600],
  },
  progressBarContainer: {
    marginBottom: theme.spacing.md,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accent[500],
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[600],
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
  statIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary[800],
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary[600],
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  activityCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  activityTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary[800],
  },
  activityDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[600],
  },
  activityPoints: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent[600],
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyActivityIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
    opacity: 0.5,
  },
  emptyActivityText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[500],
    textAlign: 'center',
  },
});

export default DashboardScreen;
