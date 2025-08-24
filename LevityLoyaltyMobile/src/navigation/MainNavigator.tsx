/**
 * Main Navigator
 * Bottom tab navigation for authenticated users
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text} from 'react-native';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import CheckInScreen from '../screens/CheckInScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import theme
import {theme} from '../constants/theme';

// Icons (we'll use simple text for now, can be replaced with vector icons later)
const TabIcon: React.FC<{name: string; focused: boolean}> = ({name, focused}) => (
  <View style={{alignItems: 'center', justifyContent: 'center'}}>
    <Text style={{
      fontSize: 24,
      color: focused ? theme.colors.primary[600] : theme.colors.gray[400]
    }}>
      {name === 'Dashboard' && '🏠'}
      {name === 'CheckIn' && '📱'}
      {name === 'Rewards' && '🎁'}
      {name === 'Profile' && '👤'}
    </Text>
    <Text style={{
      fontSize: 12,
      color: focused ? theme.colors.primary[600] : theme.colors.gray[400],
      marginTop: 2
    }}>
      {name}
    </Text>
  </View>
);

export type MainTabParamList = {
  Dashboard: undefined;
  CheckIn: undefined;
  Rewards: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused}) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarLabel: () => null, // Hide default labels since we show them in the icon
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.gray[200],
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarActiveTintColor: theme.colors.primary[600],
        tabBarInactiveTintColor: theme.colors.gray[400],
      })}
      initialRouteName="Dashboard">
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="CheckIn" component={CheckInScreen} />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
