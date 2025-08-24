#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ctqhnyvxowuruezekmqo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0cWhueXZ4b3d1cnVlemVrbXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA4NjksImV4cCI6MjA3MTYzNjg2OX0.ANA3jw2Byp-7u6o30AH3j8IyclDgx5XivTk_WAfOH6k';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Don't persist for testing
    detectSessionInUrl: false,
  },
});

async function testAuthentication() {
  console.log('🔍 Testing Supabase Authentication (Cross-Device Sign-In Fix)...\n');

  // Test 1: Try to sign up a new user
  console.log('1️⃣ Testing Sign Up...');
  const testEmail = `testuser${Date.now()}@gmail.com`;
  const testPassword = 'password123';
  let newUserId = null;
  
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Sign up failed:', signUpError.message);
      console.error('Error details:', signUpError);
    } else {
      console.log('✅ Sign up successful!');
      console.log('User ID:', signUpData.user?.id);
      console.log('Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('Session:', signUpData.session ? 'Created' : 'Not created');
      newUserId = signUpData.user?.id;
    }
  } catch (error) {
    console.error('❌ Sign up exception:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Try to sign in with newly created user
  console.log('2️⃣ Testing Sign In with Newly Created User...');

  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      console.error('Error details:', signInError);
    } else {
      console.log('✅ Sign in successful!');
      console.log('User ID:', signInData.user?.id);
      console.log('Email:', signInData.user?.email);
      console.log('Session:', signInData.session ? 'Active' : 'Not active');
      
      // Test getting user profile
      if (signInData.user) {
        console.log('\n📋 Fetching user profile...');
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', signInData.user.id)
          .single();

        if (profileError) {
          console.error('❌ Profile fetch failed:', profileError.message);
        } else {
          console.log('✅ Profile fetched successfully!');
          console.log('Profile:', userProfile);
        }
      }
    }
  } catch (error) {
    console.error('❌ Sign in exception:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Check current session
  console.log('3️⃣ Testing Session Management...');
  
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError.message);
    } else {
      console.log('✅ Session check successful!');
      console.log('Active session:', sessionData.session ? 'Yes' : 'No');
      if (sessionData.session) {
        console.log('User ID:', sessionData.session.user.id);
        console.log('Expires at:', new Date(sessionData.session.expires_at * 1000));
      }
    }
  } catch (error) {
    console.error('❌ Session check exception:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Cross-Device Sign-In Simulation
  console.log('4️⃣ Testing Cross-Device Sign-In Simulation...');

  if (newUserId && testEmail) {
    // Create a new Supabase client to simulate a different device
    const deviceTwoClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false, // Simulate fresh device
        detectSessionInUrl: false,
      },
    });

    try {
      console.log('📱 Simulating sign-in from Device 2...');
      const { data: device2SignIn, error: device2Error } = await deviceTwoClient.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (device2Error) {
        console.error('❌ Device 2 sign-in failed:', device2Error.message);
      } else {
        console.log('✅ Device 2 sign-in successful!');
        console.log('User ID matches:', device2SignIn.user?.id === newUserId ? 'Yes' : 'No');
        console.log('Session created:', device2SignIn.session ? 'Yes' : 'No');

        // Test accessing user data from device 2
        if (device2SignIn.user) {
          const { data: userProfile, error: profileError } = await deviceTwoClient
            .from('users')
            .select('*')
            .eq('id', device2SignIn.user.id)
            .single();

          if (profileError) {
            console.error('❌ Device 2 profile access failed:', profileError.message);
          } else {
            console.log('✅ Device 2 can access user profile!');
            console.log('Profile name:', userProfile.name);
            console.log('Profile points:', userProfile.points);
          }
        }
      }
    } catch (error) {
      console.error('❌ Device 2 sign-in exception:', error.message);
    }
  } else {
    console.log('⚠️ Skipping cross-device test - no valid user created');
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Check database connection
  console.log('5️⃣ Testing Database Connection...');

  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
    } else {
      console.log('✅ Database connection successful!');
    }
  } catch (error) {
    console.error('❌ Database connection exception:', error.message);
  }
}

// Run the test
testAuthentication().catch(console.error);
