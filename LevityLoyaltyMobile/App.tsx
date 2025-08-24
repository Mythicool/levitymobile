/**
 * Levity Loyalty Mobile App
 * React Native version of the Levity Breakfast House loyalty program
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {StatusBar} from 'react-native';
import Toast from 'react-native-toast-message';

// Import screens
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';

// Import contexts
import {AuthProvider, useAuth} from './src/contexts/AuthContext';

// Import theme
import {theme} from './src/constants/theme';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

function AppNavigator(): React.JSX.Element {
  const {user, loading} = useAuth();

  if (loading) {
    // TODO: Add loading screen component
    return <></>;
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

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.primary[50]}
        />
        <AppNavigator />
        <Toast />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
