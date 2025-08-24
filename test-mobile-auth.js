#!/usr/bin/env node

// Test the actual mobile app authentication service
const path = require('path');

// Mock React Native AsyncStorage for Node.js testing
const mockAsyncStorage = {
  getItem: async (key) => {
    console.log(`📱 AsyncStorage.getItem(${key})`);
    return null;
  },
  setItem: async (key, value) => {
    console.log(`📱 AsyncStorage.setItem(${key}, ${value.substring(0, 50)}...)`);
  },
  removeItem: async (key) => {
    console.log(`📱 AsyncStorage.removeItem(${key})`);
  },
};

// Mock the AsyncStorage module
require.cache[require.resolve('@react-native-async-storage/async-storage')] = {
  exports: mockAsyncStorage,
};

// Set environment variables
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://ctqhnyvxowuruezekmqo.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0cWhueXZ4b3d1cnVlemVrbXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA4NjksImV4cCI6MjA3MTYzNjg2OX0.ANA3jw2Byp-7u6o30AH3j8IyclDgx5XivTk_WAfOH6k';
process.env.EXPO_PUBLIC_USE_PRODUCTION_DB = 'true';

async function testMobileAuthService() {
  console.log('🔍 Testing Mobile App Authentication Service...\n');

  try {
    // Import the mobile app services
    const { authService, userService, isUsingProductionDB, getServiceInfo } = require('./LevityLoyaltyExpo/src/services/dataServiceAdapter');

    console.log('📋 Service Configuration:');
    console.log('Using Production DB:', isUsingProductionDB());
    console.log('Service Info:', getServiceInfo());
    console.log('');

    // Test 1: Create a new user
    console.log('1️⃣ Testing User Registration...');
    const testEmail = `mobiletest${Date.now()}@gmail.com`;
    const testPassword = 'password123';
    const testName = 'Mobile Test User';

    const signUpResult = await authService.signUp({
      email: testEmail,
      password: testPassword,
      data: { name: testName }
    });

    if (signUpResult.success) {
      console.log('✅ Registration successful!');
      console.log('User ID:', signUpResult.data?.id);
      console.log('User Name:', signUpResult.data?.name);
      console.log('User Points:', signUpResult.data?.points);
    } else {
      console.error('❌ Registration failed:', signUpResult.error);
      return;
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Sign in with the same credentials (simulating different device)
    console.log('2️⃣ Testing Cross-Device Sign-In...');
    
    const signInResult = await authService.signIn(testEmail, testPassword);

    if (signInResult.success) {
      console.log('✅ Cross-device sign-in successful!');
      console.log('User ID:', signInResult.data?.id);
      console.log('User Name:', signInResult.data?.name);
      console.log('User Points:', signInResult.data?.points);
      console.log('Last Check-in:', signInResult.data?.last_check_in || 'Never');
    } else {
      console.error('❌ Cross-device sign-in failed:', signInResult.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Test user service methods
    console.log('3️⃣ Testing User Service Methods...');
    
    if (signUpResult.data?.id) {
      const userById = await userService.getUserById(signUpResult.data.id);
      
      if (userById.success) {
        console.log('✅ getUserById successful!');
        console.log('Retrieved user:', userById.data?.name);
      } else {
        console.error('❌ getUserById failed:', userById.error);
      }

      const userByEmail = await userService.getUserByEmail(testEmail);
      
      if (userByEmail.success) {
        console.log('✅ getUserByEmail successful!');
        console.log('Retrieved user:', userByEmail.data?.name);
      } else {
        console.error('❌ getUserByEmail failed:', userByEmail.error);
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Test authentication with userService methods
    console.log('4️⃣ Testing UserService Authentication...');
    
    const authResult = await userService.authenticateUser(testEmail, testPassword);
    
    if (authResult.success) {
      console.log('✅ UserService authentication successful!');
      console.log('Authenticated user:', authResult.data?.name);
    } else {
      console.error('❌ UserService authentication failed:', authResult.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Test current user retrieval
    console.log('5️⃣ Testing Current User Retrieval...');
    
    const currentUser = await authService.getCurrentUser();
    
    if (currentUser.success) {
      console.log('✅ Current user retrieval successful!');
      console.log('Current user:', currentUser.data?.name);
      console.log('Current user ID:', currentUser.data?.id);
    } else {
      console.error('❌ Current user retrieval failed:', currentUser.error);
    }

  } catch (error) {
    console.error('❌ Test failed with exception:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testMobileAuthService().catch(console.error);
