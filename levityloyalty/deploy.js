#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Levity Loyalty - Deployment Script');
console.log('=====================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if dist directory exists, if not build the project
if (!fs.existsSync('dist')) {
  console.log('📦 Building project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully\n');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('📁 Found existing dist directory\n');
}

// Check if Netlify CLI is installed
try {
  execSync('netlify --version', { stdio: 'pipe' });
  console.log('✅ Netlify CLI is installed');
} catch (error) {
  console.log('📦 Installing Netlify CLI...');
  try {
    execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    console.log('✅ Netlify CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Netlify CLI:', installError.message);
    console.log('\n💡 Please install manually: npm install -g netlify-cli');
    process.exit(1);
  }
}

console.log('\n🌐 Deployment Options:');
console.log('1. Deploy to existing site (if linked)');
console.log('2. Create new site and deploy');
console.log('3. Deploy preview (draft)');

// Check if site is already linked
const netlifyConfigExists = fs.existsSync('.netlify/state.json');

if (netlifyConfigExists) {
  console.log('\n✅ Site is already linked to Netlify');
  
  // Deploy to production
  console.log('🚀 Deploying to production...');
  try {
    execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
    console.log('\n✅ Deployment successful!');
    
    // Get site info
    try {
      const siteInfo = execSync('netlify status', { encoding: 'utf8' });
      console.log('\n📊 Site Information:');
      console.log(siteInfo);
    } catch (statusError) {
      console.log('ℹ️  Run "netlify status" to see site information');
    }
    
  } catch (deployError) {
    console.error('❌ Deployment failed:', deployError.message);
    process.exit(1);
  }
} else {
  console.log('\n🔗 Site not linked. Please choose an option:');
  console.log('');
  console.log('Option 1: Link to existing site');
  console.log('  netlify link');
  console.log('');
  console.log('Option 2: Create new site');
  console.log('  netlify init');
  console.log('');
  console.log('Option 3: One-time deploy');
  console.log('  netlify deploy --dir=dist');
  console.log('');
  console.log('💡 After linking, run this script again to deploy');
}

console.log('\n📋 Post-Deployment Checklist:');
console.log('1. ✅ Set environment variables in Netlify dashboard');
console.log('2. ✅ Configure custom domain (optional)');
console.log('3. ✅ Test all application features');
console.log('4. ✅ Set up Netlify Blobs integration');
console.log('');
console.log('🔗 Netlify Dashboard: https://app.netlify.com');
console.log('📖 Setup Guide: See NETLIFY_SETUP.md');
console.log('');
console.log('🎉 Happy deploying!');
