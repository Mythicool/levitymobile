/**
 * Check-In Screen
 * Adapted from the web app's CheckIn component
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';

import {useAuth} from '../contexts/AuthContext';
import {theme} from '../constants/theme';
import {MainTabParamList} from '../navigation/MainNavigator';
import QRCodeScanner from '../components/QRCodeScanner';
import {offlineStorage} from '../services/offlineStorage';

// Mock checkin service for demo
const mockCheckinService = {
  async canCheckIn(userId: string) {
    return { success: true, canCheckIn: true };
  },

  async checkIn(userId: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      pointsEntry: {
        points: 10,
        reason: 'Daily check-in'
      }
    };
  }
};

type CheckInScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'CheckIn'>;

const CheckInScreen: React.FC = () => {
  const navigation = useNavigation<CheckInScreenNavigationProp>();
  const {user, refreshUser} = useAuth();

  const [isScanning, setIsScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<{
    success: boolean;
    message: string;
    pointsEarned?: number;
  } | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(true);

  useEffect(() => {
    if (user) {
      checkCanCheckIn();
    }
  }, [user]);

  const checkCanCheckIn = async () => {
    if (!user) return;

    try {
      const result = await mockCheckinService.canCheckIn(user.id);
      if (result.success) {
        setCanCheckIn(result.canCheckIn);
      }
    } catch (error) {
      console.error('Error checking check-in status:', error);
    }
  };

  const handleQRScanSuccess = async (qrData: string) => {
    setShowScanner(false);
    await processCheckIn(qrData);
  };

  const handleDemoCheckIn = async () => {
    await processCheckIn('demo-checkin-levity-loyalty');
  };

  const processCheckIn = async (qrData: string) => {
    if (!user) return;

    setIsScanning(true);
    setCheckInStatus(null);

    // Haptic feedback
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = await mockCheckinService.checkIn(user.id);

      if (result.success && result.pointsEntry) {
        // Save to offline storage
        await offlineStorage.addPointsEntry({
          userId: user.id,
          points: result.pointsEntry.points,
          reason: result.pointsEntry.reason,
          timestamp: new Date().toISOString(),
          type: 'earned',
        });

        // Success haptic feedback
        if (Platform.OS === 'ios') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }

        setCheckInStatus({
          success: true,
          message: `Check-in successful! You earned ${result.pointsEntry.points} points.`,
          pointsEarned: result.pointsEntry.points,
        });
        setCanCheckIn(false);

        // Refresh user data to get updated points
        await refreshUser();
      } else {
        // Error haptic feedback
        if (Platform.OS === 'ios') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        setCheckInStatus({
          success: false,
          message: result.error || 'Check-in failed',
        });
      }
    } catch (error) {
      setCheckInStatus({
        success: false,
        message: 'Check-in failed. Please try again.',
      });
    } finally {
      setIsScanning(false);
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
          <Text style={styles.headerIcon}>📱</Text>
          <Text style={styles.title}>Check In</Text>
          <Text style={styles.subtitle}>
            Scan the QR code at Levity Breakfast House to earn points
          </Text>
        </View>

        {/* Check-in Status */}
        {checkInStatus && (
          <View style={[
            styles.statusCard,
            checkInStatus.success ? styles.successCard : styles.errorCard
          ]}>
            <Text style={styles.statusIcon}>
              {checkInStatus.success ? '✅' : '⚠️'}
            </Text>
            <View style={styles.statusContent}>
              <Text style={[
                styles.statusTitle,
                checkInStatus.success ? styles.successText : styles.errorText
              ]}>
                {checkInStatus.success ? 'Success!' : 'Already Checked In'}
              </Text>
              <Text style={[
                styles.statusMessage,
                checkInStatus.success ? styles.successText : styles.errorText
              ]}>
                {checkInStatus.message}
              </Text>
              {checkInStatus.pointsEarned && (
                <Text style={styles.pointsEarned}>
                  +{checkInStatus.pointsEarned} points
                </Text>
              )}
            </View>
          </View>
        )}

        {/* QR Code Scanner Simulation */}
        <View style={styles.scannerCard}>
          <Text style={styles.scannerTitle}>Scan QR Code</Text>
          
          <View style={styles.scannerArea}>
            {isScanning ? (
              <View style={styles.scanningState}>
                <View style={styles.spinner} />
                <Text style={styles.scanningText}>Scanning...</Text>
              </View>
            ) : (
              <View style={styles.cameraState}>
                <Text style={styles.cameraIcon}>📷</Text>
                <Text style={styles.cameraText}>Point camera at QR code</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.scanButton, (!canCheckIn || isScanning) && styles.scanButtonDisabled]}
            onPress={() => setShowScanner(true)}
            disabled={isScanning || !canCheckIn}>
            <Text style={styles.scanButtonText}>
              {isScanning
                ? 'Processing...'
                : canCheckIn
                ? 'Scan QR Code'
                : 'Already Checked In Today'}
            </Text>
          </TouchableOpacity>

          {/* Demo Button */}
          <View style={styles.demoSection}>
            <Text style={styles.demoText}>
              {canCheckIn
                ? 'Scan the QR code or use demo check-in:'
                : 'Come back tomorrow for more points!'}
            </Text>
            {canCheckIn && (
              <TouchableOpacity
                style={styles.demoButton}
                onPress={handleDemoCheckIn}
                disabled={isScanning}>
                <Text style={styles.demoButtonText}>Demo Check-In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Check In</Text>
          
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Find the QR code</Text>
              <Text style={styles.stepDescription}>
                Look for the Levity Loyalty QR code at your table or at the counter
              </Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Scan with your phone</Text>
              <Text style={styles.stepDescription}>
                Use this app or your phone's camera to scan the code
              </Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Earn points automatically</Text>
              <Text style={styles.stepDescription}>
                Receive 10 points for each visit (once per day)
              </Text>
            </View>
          </View>
        </View>

        {/* Current Points */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsIcon}>⭐</Text>
          <Text style={styles.pointsValue}>{user.points}</Text>
          <Text style={styles.pointsLabel}>Current Points Balance</Text>
          <TouchableOpacity 
            style={styles.rewardsButton}
            onPress={() => navigation.navigate('Rewards')}>
            <Text style={styles.rewardsButtonText}>View Available Rewards</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Code Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        presentationStyle="fullScreen">
        <QRCodeScanner
          isVisible={showScanner}
          onScanSuccess={handleQRScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      </Modal>
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
  headerIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
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
  },
  statusCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: theme.colors.success[50],
    borderColor: theme.colors.success[200],
    borderWidth: 1,
  },
  errorCard: {
    backgroundColor: theme.colors.warning[50],
    borderColor: theme.colors.warning[200],
    borderWidth: 1,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  statusMessage: {
    fontSize: theme.fontSize.base,
  },
  successText: {
    color: theme.colors.success[600],
  },
  errorText: {
    color: theme.colors.warning[600],
  },
  pointsEarned: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent[600],
    marginTop: theme.spacing.sm,
  },
  scannerCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  scannerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary[800],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  scannerArea: {
    width: 200,
    height: 200,
    backgroundColor: theme.colors.primary[50],
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  scanningState: {
    alignItems: 'center',
  },
  spinner: {
    width: 32,
    height: 32,
    borderWidth: 3,
    borderColor: theme.colors.primary[600],
    borderTopColor: 'transparent',
    borderRadius: 16,
    marginBottom: theme.spacing.md,
    // Note: In a real app, you'd use an animated spinner
  },
  scanningText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[600],
  },
  cameraState: {
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  cameraText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[600],
  },
  scanButton: {
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  scanButtonDisabled: {
    opacity: 0.5,
  },
  scanButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  demoSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary[100],
    paddingTop: theme.spacing.lg,
    alignItems: 'center',
  },
  demoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  demoButton: {
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  demoButtonText: {
    color: theme.colors.gray[700],
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
  },
  instructionsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  instructionsTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  stepText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[600],
  },
  pointsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  pointsIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.md,
  },
  pointsValue: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent[600],
    marginBottom: theme.spacing.sm,
  },
  pointsLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.lg,
  },
  rewardsButton: {
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  rewardsButtonText: {
    color: theme.colors.gray[700],
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
  },
});

export default CheckInScreen;
