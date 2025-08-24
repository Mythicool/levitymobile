/**
 * Levity Loyalty Mobile App - Expo Version
 * React Native version of the Levity Breakfast House loyalty program
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {StatusBar} from 'expo-status-bar';

// Import screens
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';

// Import contexts
import {AuthProvider, useAuth} from './src/contexts/AuthContext';

// Import components
import LoadingScreen from './src/components/LoadingScreen';

// Import theme
import {theme} from './src/constants/theme';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

function AppNavigator(): React.JSX.Element {
  const {user, loading} = useAuth();

  if (loading) {
    return <LoadingScreen message="Initializing..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" backgroundColor={theme.colors.primary[50]} />
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
