// Environment validation utility for Levity Loyalty application
// This utility helps validate that all required environment variables are properly set

// Debug logging
const debugLog = (message, data = "") => {
  if (
    import.meta.env.VITE_ENVIRONMENT === "development" ||
    import.meta.env.DEV
  ) {
    console.log(`[Environment Validator] ${message}`, data);
  }
};

// Validate database environment variables
export const validateDatabaseEnvironment = () => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    info: {},
  };

  // Check for database URL
  const viteDbUrl = import.meta.env.VITE_DATABASE_URL;
  const regularDbUrl = import.meta.env.DATABASE_URL;
  const hasDbUrl = !!(viteDbUrl || regularDbUrl);

  validation.info.hasViteDbUrl = !!viteDbUrl;
  validation.info.hasRegularDbUrl = !!regularDbUrl;
  validation.info.dbUrlSource = viteDbUrl ? 'VITE_DATABASE_URL' : regularDbUrl ? 'DATABASE_URL' : 'none';

  if (!hasDbUrl) {
    validation.errors.push('No database URL found. Set VITE_DATABASE_URL or DATABASE_URL');
    validation.isValid = false;
  } else {
    const dbUrl = viteDbUrl || regularDbUrl;
    
    // Validate URL format
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      validation.errors.push('Database URL must start with postgresql:// or postgres://');
      validation.isValid = false;
    }

    // Check URL length (basic sanity check)
    if (dbUrl.length < 20) {
      validation.warnings.push('Database URL seems too short, please verify it is complete');
    }

    validation.info.dbUrlLength = dbUrl.length;
    validation.info.dbUrlFormat = dbUrl.startsWith('postgresql://') ? 'postgresql://' : 
                                  dbUrl.startsWith('postgres://') ? 'postgres://' : 'unknown';
  }

  return validation;
};

// Validate storage preference environment variable
export const validateStoragePreference = () => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    info: {},
  };

  const storagePreference = import.meta.env.VITE_STORAGE_PREFERENCE;
  const validPreferences = ['auto', 'database', 'blobs'];

  validation.info.storagePreference = storagePreference || 'auto (default)';
  validation.info.isExplicitlySet = !!storagePreference;

  if (storagePreference && !validPreferences.includes(storagePreference)) {
    validation.errors.push(`Invalid VITE_STORAGE_PREFERENCE: ${storagePreference}. Must be one of: ${validPreferences.join(', ')}`);
    validation.isValid = false;
  }

  // Check for potential issues
  if (storagePreference === 'database') {
    const dbValidation = validateDatabaseEnvironment();
    if (!dbValidation.isValid) {
      validation.warnings.push('VITE_STORAGE_PREFERENCE is set to "database" but database configuration is invalid');
    }
  }

  return validation;
};

// Validate Netlify environment variables
export const validateNetlifyEnvironment = () => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    info: {},
  };

  const siteId = import.meta.env.VITE_NETLIFY_SITE_ID;
  const token = import.meta.env.VITE_NETLIFY_TOKEN;

  validation.info.hasSiteId = !!siteId;
  validation.info.hasToken = !!token;
  validation.info.isNetlifyEnvironment = typeof window !== 'undefined' &&
    (window.location.hostname.includes('netlify.app') ||
     window.location.hostname.includes('netlify.com') ||
     !!siteId);

  if (!siteId) {
    validation.warnings.push('VITE_NETLIFY_SITE_ID not set - Netlify Blobs may not work properly');
  }

  if (!token) {
    validation.warnings.push('VITE_NETLIFY_TOKEN not set - Netlify Blobs may not work properly');
  }

  return validation;
};

// Comprehensive environment validation
export const validateEnvironment = () => {
  debugLog('Running comprehensive environment validation');

  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    info: {
      environment: import.meta.env.MODE || 'unknown',
      isDev: import.meta.env.DEV,
      isProd: import.meta.env.PROD,
      timestamp: new Date().toISOString(),
    },
    components: {},
  };

  // Validate each component
  const components = {
    database: validateDatabaseEnvironment(),
    storage: validateStoragePreference(),
    netlify: validateNetlifyEnvironment(),
  };

  validation.components = components;

  // Aggregate results
  Object.values(components).forEach(component => {
    if (!component.isValid) {
      validation.isValid = false;
    }
    validation.errors.push(...component.errors);
    validation.warnings.push(...component.warnings);
  });

  // Add overall recommendations
  if (validation.components.storage.info.storagePreference === 'auto') {
    if (validation.components.database.isValid) {
      validation.info.recommendedAction = 'Database is configured and will be used automatically';
    } else {
      validation.info.recommendedAction = 'Database not configured, will fall back to Netlify Blobs';
    }
  } else if (validation.components.storage.info.storagePreference === 'database') {
    if (!validation.components.database.isValid) {
      validation.errors.push('Storage preference is set to "database" but database configuration is invalid');
      validation.isValid = false;
    }
  }

  debugLog('Environment validation completed', {
    isValid: validation.isValid,
    errorCount: validation.errors.length,
    warningCount: validation.warnings.length,
  });

  return validation;
};

// Get environment summary for debugging
export const getEnvironmentSummary = () => {
  const validation = validateEnvironment();
  
  return {
    status: validation.isValid ? 'VALID' : 'INVALID',
    environment: validation.info.environment,
    storagePreference: validation.components.storage.info.storagePreference,
    databaseConfigured: validation.components.database.isValid,
    netlifyConfigured: validation.components.netlify.info.hasSiteId && validation.components.netlify.info.hasToken,
    errors: validation.errors,
    warnings: validation.warnings,
    recommendedAction: validation.info.recommendedAction,
  };
};

// Console-friendly environment report
export const logEnvironmentReport = () => {
  const summary = getEnvironmentSummary();
  
  console.group('🔧 Levity Loyalty Environment Report');
  console.log(`Status: ${summary.status === 'VALID' ? '✅' : '❌'} ${summary.status}`);
  console.log(`Environment: ${summary.environment}`);
  console.log(`Storage Preference: ${summary.storagePreference}`);
  console.log(`Database: ${summary.databaseConfigured ? '✅' : '❌'} ${summary.databaseConfigured ? 'Configured' : 'Not Configured'}`);
  console.log(`Netlify: ${summary.netlifyConfigured ? '✅' : '❌'} ${summary.netlifyConfigured ? 'Configured' : 'Not Configured'}`);
  
  if (summary.errors.length > 0) {
    console.group('❌ Errors:');
    summary.errors.forEach(error => console.error(`  • ${error}`));
    console.groupEnd();
  }
  
  if (summary.warnings.length > 0) {
    console.group('⚠️ Warnings:');
    summary.warnings.forEach(warning => console.warn(`  • ${warning}`));
    console.groupEnd();
  }
  
  if (summary.recommendedAction) {
    console.log(`💡 Recommendation: ${summary.recommendedAction}`);
  }
  
  console.groupEnd();
  
  return summary;
};
