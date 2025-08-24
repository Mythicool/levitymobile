// Hybrid data service that can use both Netlify Blobs and PostgreSQL
import {
  dbUserService,
  dbPointsService,
  dbCheckinService,
  dbRedemptionsService,
  dbService,
} from "./databaseService.js";
import {
  userService as blobUserService,
  pointsService as blobPointsService,
  checkinService as blobCheckinService,
  redemptionsService as blobRedemptionsService,
  databaseService as blobDatabaseService,
} from "./dataService.js";
import {
  validateEnvironment,
  logEnvironmentReport,
} from "../utils/environmentValidator.js";

// Debug logging
const debugLog = (message, data = "") => {
  if (
    import.meta.env.VITE_ENVIRONMENT === "development" ||
    import.meta.env.DEV
  ) {
    console.log(`[Hybrid Service] ${message}`, data);
  }
};

// Determine which storage system to use
const getStoragePreference = () => {
  // Validate environment first
  const envValidation = validateEnvironment();

  if (!envValidation.isValid) {
    debugLog("Environment validation failed", envValidation.errors);
    // Log environment report in development
    if (import.meta.env.DEV) {
      logEnvironmentReport();
    }
  }

  // Check environment variable for storage preference
  const preference = import.meta.env.VITE_STORAGE_PREFERENCE || "auto";

  debugLog(`Storage preference: ${preference}`);

  // If explicitly set to database, try to use it even if availability check fails initially
  if (preference === "database") {
    const hasDbUrl = !!(
      import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL
    );
    debugLog(`Database URL available: ${hasDbUrl}`);

    if (hasDbUrl) {
      debugLog("Forcing database usage due to explicit preference");
      return "database";
    } else {
      debugLog(
        "Database preference set but no URL found, falling back to blobs"
      );
      console.warn(
        "⚠️ VITE_STORAGE_PREFERENCE is set to 'database' but no database URL is configured!"
      );
      return "blobs";
    }
  } else if (preference === "blobs") {
    debugLog("Forcing blobs usage due to explicit preference");
    return "blobs";
  } else {
    // Auto-detect: prefer database if available, fallback to blobs
    const dbAvailable = dbService.isAvailable();
    debugLog(`Auto-detect mode: database available = ${dbAvailable}`);
    return dbAvailable ? "database" : "blobs";
  }
};

// Get the appropriate service based on storage preference
const getService = (serviceType) => {
  const storage = getStoragePreference();
  debugLog(`Using ${storage} storage for ${serviceType}`);

  const services = {
    database: {
      user: dbUserService,
      points: dbPointsService,
      checkin: dbCheckinService,
      redemptions: dbRedemptionsService,
      database: dbService,
    },
    blobs: {
      user: blobUserService,
      points: blobPointsService,
      checkin: blobCheckinService,
      redemptions: blobRedemptionsService,
      database: blobDatabaseService,
    },
  };

  return services[storage][serviceType];
};

// Hybrid User Service
export const userService = {
  async createUser(userData) {
    const service = getService("user");
    return await service.createUser(userData);
  },

  async getUserByEmail(email) {
    const service = getService("user");
    return await service.getUserByEmail(email);
  },

  async getUserById(userId) {
    const service = getService("user");
    return await service.getUserById(userId);
  },

  async updateUser(userId, updates) {
    const service = getService("user");
    return await service.updateUser(userId, updates);
  },

  async authenticateUser(email, password) {
    const service = getService("user");
    return await service.authenticateUser(email, password);
  },
};

// Hybrid Points Service
export const pointsService = {
  async addPoints(userId, points, reason) {
    const service = getService("points");
    return await service.addPoints(userId, points, reason);
  },

  async getPointsHistory(userId) {
    const service = getService("points");
    return await service.getPointsHistory(userId);
  },
};

// Hybrid Check-in Service
export const checkinService = {
  async canCheckIn(userId) {
    const service = getService("checkin");
    return await service.canCheckIn(userId);
  },

  async checkIn(userId, pointsToEarn) {
    const service = getService("checkin");
    return await service.checkIn(userId, pointsToEarn);
  },
};

// Hybrid Redemptions Service
export const redemptionsService = {
  async redeemReward(userId, rewardId, pointsCost, rewardName) {
    const service = getService("redemptions");
    return await service.redeemReward(userId, rewardId, pointsCost, rewardName);
  },

  async getRedemptionHistory(userId) {
    const service = getService("redemptions");
    return await service.getRedemptionHistory(userId);
  },
};

// Hybrid Database Service
export const databaseService = {
  async testConnection() {
    const storage = getStoragePreference();
    const service = getService("database");

    const result = await service.testConnection();

    return {
      ...result,
      storageType: storage,
      preference: import.meta.env.VITE_STORAGE_PREFERENCE || "auto",
    };
  },

  getEnvironmentInfo() {
    const storage = getStoragePreference();
    const dbInfo = dbService.getEnvironmentInfo();
    const blobInfo = blobDatabaseService.getEnvironmentInfo();
    const envValidation = validateEnvironment();

    return {
      currentStorage: storage,
      preference: import.meta.env.VITE_STORAGE_PREFERENCE || "auto",
      database: dbInfo,
      blobs: blobInfo,
      available: {
        database: dbService.isAvailable(),
        blobs: true, // Blobs always available as fallback
      },
      validation: envValidation,
    };
  },

  // Validate environment configuration
  validateEnvironment() {
    return validateEnvironment();
  },

  // Log environment report to console
  logEnvironmentReport() {
    return logEnvironmentReport();
  },

  // Test all database operations
  async testAllOperations() {
    const storage = getStoragePreference();
    if (storage === "database") {
      return await dbService.testAllOperations();
    } else {
      return {
        success: false,
        error:
          "Database operations test only available when using database storage",
        currentStorage: storage,
      };
    }
  },

  async testBothSystems() {
    debugLog("Testing both storage systems");

    const results = {
      database: { available: false },
      blobs: { available: false },
    };

    // Test database
    try {
      if (dbService.isAvailable()) {
        results.database = await dbService.testConnection();
        results.database.available = results.database.success;
      } else {
        results.database = { success: false, error: "Database not configured" };
      }
    } catch (error) {
      results.database = { success: false, error: error.message };
    }

    // Test blobs
    try {
      results.blobs = await blobDatabaseService.testConnection();
      results.blobs.available = results.blobs.environment === "netlify";
    } catch (error) {
      results.blobs = { success: false, error: error.message };
    }

    return {
      currentStorage: getStoragePreference(),
      systems: results,
      recommendation: results.database.available ? "database" : "blobs",
    };
  },

  // Migration utilities
  async migrateFromBlobsToDatabase() {
    debugLog("Starting migration from Blobs to Database");

    if (!dbService.isAvailable()) {
      return { success: false, error: "Database not available for migration" };
    }

    try {
      // This would implement migration logic
      // For now, return a placeholder
      return {
        success: false,
        error: "Migration not implemented yet",
        message: "Manual migration required",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// Export storage preference for other components
export const getStorageType = getStoragePreference;
