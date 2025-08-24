/**
 * Rewards Screen
 * Placeholder for rewards catalog
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import {theme} from '../constants/theme';

const RewardsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎁</Text>
        <Text style={styles.heading}>Rewards</Text>
        <Text style={styles.subtitle}>Coming Soon!</Text>
        <Text style={styles.description}>
          The rewards catalog will be implemented in the next phase.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[50],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  heading: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.accent[600],
    marginBottom: theme.spacing.lg,
  },
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[600],
    textAlign: 'center',
  },
});

export default RewardsScreen;
