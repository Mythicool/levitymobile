/**
 * Loading Screen Component
 * Displays during authentication and app initialization
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '../constants/theme';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Continuous rotation animation for loading indicator
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    return () => {
      rotateAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo/Brand */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>☕</Text>
          <Text style={styles.brandName}>Levity</Text>
          <Text style={styles.brandSubtitle}>Loyalty</Text>
        </View>

        {/* Loading Indicator */}
        <Animated.View 
          style={[
            styles.loadingIndicator,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <View style={styles.spinner} />
        </Animated.View>

        {/* Loading Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Earn points with every visit
        </Text>
      </Animated.View>

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {Array.from({ length: 20 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.patternDot,
              {
                left: `${(index % 5) * 20 + 10}%`,
                top: `${Math.floor(index / 5) * 20 + 10}%`,
                opacity: 0.1,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  brandName: {
    fontSize: theme.fontSize['4xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.xs,
  },
  brandSubtitle: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.accent[600],
    fontWeight: theme.fontWeight.medium,
  },
  loadingIndicator: {
    marginBottom: theme.spacing.xl,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: theme.colors.primary[200],
    borderTopColor: theme.colors.accent[500],
  },
  message: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary[700],
    marginBottom: theme.spacing.lg,
    fontWeight: theme.fontWeight.medium,
  },
  tagline: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[600],
    textAlign: 'center',
    opacity: 0.8,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary[300],
  },
});

export default LoadingScreen;
