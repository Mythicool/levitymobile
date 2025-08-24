// Import the CORS-safe Netlify Blobs client
import {
  getUsersStore,
  getPointsStore,
  getRedemptionsStore,
} from "./netlifyBlobsClient.js";

// Debug logging for environment detection
const debugLog = (message, data = "") => {
  if (
    import.meta.env.VITE_ENVIRONMENT === "development" ||
    import.meta.env.DEV
  ) {
    console.log(`[Levity Loyalty Debug] ${message}`, data);
  }
};

// Check if we're in a Netlify environment
const isNetlifyEnvironment = () => {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname.includes("netlify.app") ||
      window.location.hostname.includes("netlify.com") ||
      import.meta.env.VITE_NETLIFY_SITE_ID)
  );
};

// Database connection test and diagnostics
export const databaseService = {
  // Test database connection
  async testConnection() {
    debugLog("Testing database connection...");

    const results = {
      environment: isNetlifyEnvironment() ? "netlify" : "local",
      stores: {},
      errors: [],
    };

    // Test each store
    const stores = [
      { name: "users", factory: getUsersStore },
      { name: "points-history", factory: getPointsStore },
      { name: "redemptions", factory: getRedemptionsStore },
    ];

    for (const { name, factory } of stores) {
      try {
        const store = await factory();

        // Test basic operations
        const testKey = `test_${Date.now()}`;
        const testData = JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
        });

        // Test write
        await store.set(testKey, testData);
        debugLog(`Store ${name}: Write test passed`);

        // Test read
        const retrieved = await store.get(testKey, { type: "text" });
        debugLog(
          `Store ${name}: Read test passed`,
          retrieved ? "data found" : "no data"
        );

        // Test list
        const list = await store.list();
        debugLog(
          `Store ${name}: List test passed`,
          `${list.blobs?.length || 0} items`
        );

        // Clean up test data
        await store.delete(testKey);
        debugLog(`Store ${name}: Delete test passed`);

        results.stores[name] = {
          status: "success",
          type: isNetlifyEnvironment() ? "netlify-blobs" : "localStorage",
          operations: ["set", "get", "list", "delete"],
        };
      } catch (error) {
        debugLog(`Store ${name}: Test failed`, error.message);
        results.stores[name] = {
          status: "error",
          error: error.message,
          type: "fallback",
        };
        results.errors.push(`${name}: ${error.message}`);
      }
    }

    debugLog("Database connection test completed", results);
    return results;
  },

  // Get environment information
  getEnvironmentInfo() {
    return {
      isNetlifyEnvironment: isNetlifyEnvironment(),
      hostname:
        typeof window !== "undefined" ? window.location.hostname : "server",
      hasNetlifySiteId: !!import.meta.env.VITE_NETLIFY_SITE_ID,
      hasNetlifyToken: !!import.meta.env.VITE_NETLIFY_TOKEN,
      environment: import.meta.env.VITE_ENVIRONMENT || "development",
      isDev: import.meta.env.DEV,
    };
  },

  // Clear all data (for testing)
  async clearAllData() {
    debugLog("Clearing all data...");

    const stores = [
      { name: "users", factory: getUsersStore },
      { name: "points-history", factory: getPointsStore },
      { name: "redemptions", factory: getRedemptionsStore },
    ];

    for (const { name, factory } of stores) {
      try {
        const store = await factory();
        const list = await store.list();

        for (const blob of list.blobs || []) {
          await store.delete(blob.key);
        }

        debugLog(`Cleared all data from ${name} store`);
      } catch (error) {
        debugLog(`Failed to clear ${name} store`, error.message);
      }
    }
  },
};

// User data operations
export const userService = {
  // Create a new user
  async createUser(userData) {
    try {
      const store = await getUsersStore();
      const userId = `user_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const user = {
        id: userId,
        ...userData,
        points: 0,
        joinDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await store.set(userId, JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error: error.message };
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      const store = await getUsersStore();
      const { blobs } = await store.list();

      for (const blob of blobs) {
        const userData = await store.get(blob.key, { type: "text" });
        const user = JSON.parse(userData);
        if (user.email === email) {
          return { success: true, user };
        }
      }

      return { success: false, error: "User not found" };
    } catch (error) {
      console.error("Error getting user by email:", error);
      return { success: false, error: error.message };
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const store = await getUsersStore();
      const userData = await store.get(userId, { type: "text" });

      if (!userData) {
        return { success: false, error: "User not found" };
      }

      const user = JSON.parse(userData);
      return { success: true, user };
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return { success: false, error: error.message };
    }
  },

  // Update user data
  async updateUser(userId, updates) {
    try {
      const store = await getUsersStore();
      const userData = await store.get(userId, { type: "text" });

      if (!userData) {
        return { success: false, error: "User not found" };
      }

      const user = JSON.parse(userData);
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await store.set(userId, JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  },

  // Authenticate user
  async authenticateUser(email, password) {
    try {
      const result = await this.getUserByEmail(email);
      if (!result.success) {
        return { success: false, error: "Invalid email or password" };
      }

      // In a real app, you'd hash and compare passwords
      // For this demo, we'll do a simple comparison
      if (result.user.password === password) {
        // Don't return password in response
        const { password: _, ...userWithoutPassword } = result.user;
        return { success: true, user: userWithoutPassword };
      } else {
        return { success: false, error: "Invalid email or password" };
      }
    } catch (error) {
      console.error("Error authenticating user:", error);
      return { success: false, error: error.message };
    }
  },
};

// Points history operations
export const pointsService = {
  // Add points to user
  async addPoints(userId, points, reason = "Check-in") {
    try {
      const pointsStore = await getPointsStore();
      const usersStore = await getUsersStore();

      // Create points history entry
      const pointsEntry = {
        id: `points_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        points,
        reason,
        timestamp: new Date().toISOString(),
      };

      await pointsStore.set(pointsEntry.id, JSON.stringify(pointsEntry));

      // Update user's total points
      const userData = await usersStore.get(userId, { type: "text" });
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = {
          ...user,
          points: user.points + points,
          updatedAt: new Date().toISOString(),
        };
        await usersStore.set(userId, JSON.stringify(updatedUser));
        return { success: true, user: updatedUser, pointsEntry };
      }

      return { success: false, error: "User not found" };
    } catch (error) {
      console.error("Error adding points:", error);
      return { success: false, error: error.message };
    }
  },

  // Get points history for user
  async getPointsHistory(userId) {
    try {
      const store = await getPointsStore();
      const listResult = await store.list();
      const blobs = listResult?.blobs || [];

      const userPoints = [];
      for (const blob of blobs) {
        try {
          const pointsData = await store.get(blob.key, { type: "text" });
          if (pointsData) {
            const points = JSON.parse(pointsData);
            if (points && points.userId === userId) {
              userPoints.push(points);
            }
          }
        } catch (parseError) {
          console.warn(
            "Failed to parse points data for blob:",
            blob.key,
            parseError
          );
          // Continue with other blobs
        }
      }

      // Sort by timestamp, newest first
      userPoints.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return { success: true, history: userPoints };
    } catch (error) {
      console.error("Error getting points history:", error);
      return { success: false, error: error.message, history: [] };
    }
  },
};

// Redemptions operations
export const redemptionsService = {
  // Redeem points for reward
  async redeemReward(userId, rewardId, pointsCost, rewardName) {
    try {
      const redemptionsStore = await getRedemptionsStore();
      const usersStore = await getUsersStore();

      // Get user data
      const userData = await usersStore.get(userId, { type: "text" });
      if (!userData) {
        return { success: false, error: "User not found" };
      }

      const user = JSON.parse(userData);

      // Check if user has enough points
      if (user.points < pointsCost) {
        return { success: false, error: "Insufficient points" };
      }

      // Create redemption entry
      const redemption = {
        id: `redemption_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        userId,
        rewardId,
        rewardName,
        pointsCost,
        timestamp: new Date().toISOString(),
        status: "redeemed",
      };

      await redemptionsStore.set(redemption.id, JSON.stringify(redemption));

      // Update user's points
      const updatedUser = {
        ...user,
        points: user.points - pointsCost,
        updatedAt: new Date().toISOString(),
      };

      await usersStore.set(userId, JSON.stringify(updatedUser));

      return { success: true, user: updatedUser, redemption };
    } catch (error) {
      console.error("Error redeeming reward:", error);
      return { success: false, error: error.message };
    }
  },

  // Get redemption history for user
  async getRedemptionHistory(userId) {
    try {
      const store = await getRedemptionsStore();
      const listResult = await store.list();
      const blobs = listResult?.blobs || [];

      const userRedemptions = [];
      for (const blob of blobs) {
        try {
          const redemptionData = await store.get(blob.key, { type: "text" });
          if (redemptionData) {
            const redemption = JSON.parse(redemptionData);
            if (redemption && redemption.userId === userId) {
              userRedemptions.push(redemption);
            }
          }
        } catch (parseError) {
          console.warn(
            "Failed to parse redemption data for blob:",
            blob.key,
            parseError
          );
          // Continue with other blobs
        }
      }

      // Sort by timestamp, newest first
      userRedemptions.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      return { success: true, history: userRedemptions };
    } catch (error) {
      console.error("Error getting redemption history:", error);
      return { success: false, error: error.message, history: [] };
    }
  },
};

// Check-in service
export const checkinService = {
  // Check if user can check in (once per day)
  async canCheckIn(userId) {
    try {
      const result = await pointsService.getPointsHistory(userId);
      if (!result.success) return { success: true, canCheckIn: true };

      const history = result.history || [];
      const today = new Date().toDateString();
      const todayCheckins = history.filter(
        (entry) =>
          entry &&
          entry.reason === "Check-in" &&
          entry.timestamp &&
          new Date(entry.timestamp).toDateString() === today
      );

      return { success: true, canCheckIn: todayCheckins.length === 0 };
    } catch (error) {
      console.error("Error checking check-in status:", error);
      return { success: false, error: error.message };
    }
  },

  // Perform check-in
  async checkIn(userId) {
    try {
      const canCheckInResult = await this.canCheckIn(userId);
      if (!canCheckInResult.success) {
        return canCheckInResult;
      }

      if (!canCheckInResult.canCheckIn) {
        return { success: false, error: "You've already checked in today!" };
      }

      const pointsToAdd = parseInt(import.meta.env.VITE_POINTS_PER_VISIT) || 10;
      const result = await pointsService.addPoints(
        userId,
        pointsToAdd,
        "Check-in"
      );

      return result;
    } catch (error) {
      console.error("Error during check-in:", error);
      return { success: false, error: error.message };
    }
  },
};
