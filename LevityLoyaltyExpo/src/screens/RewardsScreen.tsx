/**
 * Rewards Screen
 * Complete rewards catalog with redemption functionality
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
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import {useAuth} from '../contexts/AuthContext';
import {theme} from '../constants/theme';
import {offlineStorage} from '../services/offlineStorage';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'food' | 'drink' | 'merchandise' | 'experience';
  icon: string;
  available: boolean;
  popular?: boolean;
}

const REWARDS_CATALOG: Reward[] = [
  {
    id: 'free-coffee',
    name: 'Free Coffee',
    description: 'Any regular coffee or espresso drink',
    pointsCost: 50,
    category: 'drink',
    icon: '☕',
    available: true,
    popular: true,
  },
  {
    id: 'pastry',
    name: 'Free Pastry',
    description: 'Choice of croissant, muffin, or danish',
    pointsCost: 75,
    category: 'food',
    icon: '🥐',
    available: true,
  },
  {
    id: 'breakfast-sandwich',
    name: 'Breakfast Sandwich',
    description: 'Egg, cheese, and choice of meat on fresh bread',
    pointsCost: 100,
    category: 'food',
    icon: '🥪',
    available: true,
    popular: true,
  },
  {
    id: 'specialty-drink',
    name: 'Specialty Drink',
    description: 'Latte, cappuccino, or seasonal specialty',
    pointsCost: 75,
    category: 'drink',
    icon: '🍵',
    available: true,
  },
  {
    id: 'lunch-combo',
    name: 'Lunch Combo',
    description: 'Sandwich, side, and drink',
    pointsCost: 150,
    category: 'food',
    icon: '🍽️',
    available: true,
  },
  {
    id: 'levity-mug',
    name: 'Levity Mug',
    description: 'Ceramic mug with Levity logo',
    pointsCost: 200,
    category: 'merchandise',
    icon: '☕',
    available: true,
  },
  {
    id: 'coffee-beans',
    name: 'Coffee Beans (1lb)',
    description: 'Take home our signature blend',
    pointsCost: 175,
    category: 'merchandise',
    icon: '🫘',
    available: true,
  },
  {
    id: 'private-tasting',
    name: 'Private Coffee Tasting',
    description: 'Guided tasting experience for 2 people',
    pointsCost: 500,
    category: 'experience',
    icon: '🎯',
    available: false, // High-tier reward
  },
];

const RewardsScreen: React.FC = () => {
  const {user, refreshUser} = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All', icon: '🎁' },
    { id: 'drink', name: 'Drinks', icon: '☕' },
    { id: 'food', name: 'Food', icon: '🍽️' },
    { id: 'merchandise', name: 'Merch', icon: '🛍️' },
    { id: 'experience', name: 'Experiences', icon: '✨' },
  ];

  const filteredRewards = REWARDS_CATALOG.filter(reward =>
    selectedCategory === 'all' || reward.category === selectedCategory
  );

  const handleRedeemReward = async (reward: Reward) => {
    if (!user) return;

    if (user.points < reward.pointsCost) {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.pointsCost - user.points} more points to redeem this reward.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Redeem "${reward.name}" for ${reward.pointsCost} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => processRedemption(reward),
        },
      ]
    );
  };

  const processRedemption = async (reward: Reward) => {
    if (!user) return;

    setRedeeming(reward.id);

    // Haptic feedback
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save redemption to offline storage
      await offlineStorage.addPointsEntry({
        userId: user.id,
        points: -reward.pointsCost,
        reason: `Redeemed: ${reward.name}`,
        timestamp: new Date().toISOString(),
        type: 'redeemed',
      });

      // Update user points locally
      const updatedUser = {
        ...user,
        points: user.points - reward.pointsCost,
      };

      // Save updated user data
      await offlineStorage.saveUserData(updatedUser);

      // Refresh user context
      await refreshUser();

      // Success haptic feedback
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      Alert.alert(
        'Reward Redeemed!',
        `${reward.name} has been redeemed. Show this confirmation to staff to claim your reward.`,
        [{ text: 'Great!' }]
      );

    } catch (error) {
      Alert.alert(
        'Redemption Failed',
        'There was an error processing your redemption. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setRedeeming(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎁 Rewards</Text>
          <Text style={styles.subtitle}>Redeem your points for great rewards</Text>

          <View style={styles.pointsCard}>
            <Text style={styles.pointsValue}>{user.points}</Text>
            <Text style={styles.pointsLabel}>Available Points</Text>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Rewards Grid */}
        <View style={styles.rewardsContainer}>
          {filteredRewards.map(reward => (
            <View key={reward.id} style={styles.rewardCard}>
              {reward.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Popular</Text>
                </View>
              )}

              <Text style={styles.rewardIcon}>{reward.icon}</Text>
              <Text style={styles.rewardName}>{reward.name}</Text>
              <Text style={styles.rewardDescription}>{reward.description}</Text>

              <View style={styles.rewardFooter}>
                <Text style={styles.rewardPoints}>{reward.pointsCost} pts</Text>

                <TouchableOpacity
                  style={[
                    styles.redeemButton,
                    (user.points < reward.pointsCost || !reward.available || redeeming === reward.id) &&
                    styles.redeemButtonDisabled
                  ]}
                  onPress={() => handleRedeemReward(reward)}
                  disabled={user.points < reward.pointsCost || !reward.available || redeeming === reward.id}
                >
                  <Text style={[
                    styles.redeemButtonText,
                    (user.points < reward.pointsCost || !reward.available) &&
                    styles.redeemButtonTextDisabled
                  ]}>
                    {redeeming === reward.id
                      ? 'Redeeming...'
                      : !reward.available
                      ? 'Coming Soon'
                      : user.points < reward.pointsCost
                      ? 'Need More Points'
                      : 'Redeem'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Empty State */}
        {filteredRewards.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No rewards found</Text>
            <Text style={styles.emptyMessage}>
              Try selecting a different category
            </Text>
          </View>
        )}
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
  title: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  pointsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  pointsValue: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent[600],
  },
  pointsLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[600],
    marginTop: theme.spacing.sm,
  },
  categoryContainer: {
    marginBottom: theme.spacing.xl,
  },
  categoryScroll: {
    paddingHorizontal: theme.spacing.sm,
  },
  categoryButton: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
    alignItems: 'center',
    minWidth: 80,
    ...theme.shadows.sm,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary[600],
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[700],
    fontWeight: theme.fontWeight.medium,
  },
  categoryTextActive: {
    color: theme.colors.white,
  },
  rewardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    width: '48%',
    position: 'relative',
    ...theme.shadows.md,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.accent[500],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  popularText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  rewardIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  rewardName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary[800],
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  rewardDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },
  rewardFooter: {
    alignItems: 'center',
  },
  rewardPoints: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent[600],
    marginBottom: theme.spacing.md,
  },
  redeemButton: {
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    width: '100%',
  },
  redeemButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  redeemButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    textAlign: 'center',
  },
  redeemButtonTextDisabled: {
    color: theme.colors.gray[500],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary[700],
    marginBottom: theme.spacing.sm,
  },
  emptyMessage: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[500],
    textAlign: 'center',
  },
});

export default RewardsScreen;
