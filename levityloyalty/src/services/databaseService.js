import { eq, desc, and, gte, lt, sql } from "drizzle-orm";
import {
  getDatabase,
  isDatabaseAvailable,
  testDatabaseConnection,
  getDatabaseEnvironmentInfo,
} from "../db/connection.js";
import { users, pointsHistory, redemptions, checkIns } from "../db/schema.js";
import bcrypt from "bcryptjs";

// Database initialization flag
let isInitialized = false;

// Debug logging
const debugLog = (message, data = "") => {
  if (
    import.meta.env.VITE_ENVIRONMENT === "development" ||
    import.meta.env.DEV
  ) {
    console.log(`[Database Service] ${message}`, data);
  }
};

// Initialize database tables if they don't exist
const initializeDatabaseTables = async () => {
  if (isInitialized) {
    return { success: true, message: "Database already initialized" };
  }

  try {
    const db = getDatabase();
    if (!db) {
      return { success: false, error: "Database not available" };
    }

    debugLog("Initializing database tables...");

    // Test if tables exist by trying a simple query
    try {
      await db.select().from(users).limit(1);
      debugLog("Database tables already exist");
      isInitialized = true;
      return { success: true, message: "Database tables already exist" };
    } catch (error) {
      debugLog("Tables do not exist, creating them...", error.message);
    }

    // Create tables using raw SQL to avoid dependency issues
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" text NOT NULL UNIQUE,
        "name" text NOT NULL,
        "password" text NOT NULL,
        "points" integer DEFAULT 0 NOT NULL,
        "join_date" timestamp DEFAULT now() NOT NULL,
        "last_check_in" timestamp,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "points_history" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id"),
        "points" integer NOT NULL,
        "reason" text NOT NULL,
        "type" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "redemptions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id"),
        "reward_id" text NOT NULL,
        "reward_name" text NOT NULL,
        "points_cost" integer NOT NULL,
        "status" text DEFAULT 'completed' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "check_ins" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id"),
        "check_in_date" timestamp DEFAULT now() NOT NULL,
        "points_earned" integer NOT NULL,
        "location" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    debugLog("Database tables created successfully");
    isInitialized = true;
    return { success: true, message: "Database tables created successfully" };
  } catch (error) {
    debugLog("Failed to initialize database tables", error.message);
    return { success: false, error: error.message };
  }
};

// Database User Service
export const dbUserService = {
  // Create a new user
  async createUser(userData) {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not available");
      }

      // Initialize database tables if needed
      await initializeDatabaseTables();

      debugLog("Creating user in database", userData.email);

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Insert user
      const [newUser] = await db
        .insert(users)
        .values({
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          points: 0,
        })
        .returning();

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;

      debugLog("User created successfully", newUser.id);
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      debugLog("Failed to create user", error.message);
      return { success: false, error: error.message };
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not available");
      }

      debugLog("Getting user by email", email);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return { success: false, error: "User not found" };
      }

      debugLog("User found", user.id);
      return { success: true, user };
    } catch (error) {
      debugLog("Failed to get user by email", error.message);
      return { success: false, error: error.message };
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not available");
      }

      debugLog("Getting user by ID", userId);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      debugLog("User found", user.id);
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      debugLog("Failed to get user by ID", error.message);
      return { success: false, error: error.message };
    }
  },

  // Update user
  async updateUser(userId, updates) {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not available");
      }

      debugLog("Updating user", userId);

      // Add updated timestamp
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return { success: false, error: "User not found" };
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      debugLog("User updated successfully", userId);
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      debugLog("Failed to update user", error.message);
      return { success: false, error: error.message };
    }
  },

  // Authenticate user
  async authenticateUser(email, password) {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not available");
      }

      debugLog("Authenticating user", email);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return { success: false, error: "Invalid credentials" };
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return { success: false, error: "Invalid credentials" };
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      debugLog("User authenticated successfully", user.id);
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      debugLog("Failed to authenticate user", error.message);
      return { success: false, error: error.message };
    }
  },
};

// Database Points Service
export const dbPointsService = {
  // Add points to user
  async addPoints(userId, points, reason = "Check-in") {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not available");
      }

      debugLog("Adding points to user", { userId, points, reason });

      // Start transaction
      const result = await db.transaction(async (tx) => {
        // Add points to user
        const [updatedUser] = await tx
          .update(users)
          .set({
            points: sql`points + ${points}`,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning();

        if (!updatedUser) {
          throw new Error("User not found");
        }

        // Create points history entry
        const [pointsEntry] = await tx
          .insert(pointsHistory)
          .values({
            userId,
            points,
            reason,
            type: "earned",
          })
          .returning();

        return { user: updatedUser, pointsEntry };
      });

      debugLog("Points added successfully", result.pointsEntry.id);
      return { success: true, ...result };
    } catch (error) {
      debugLog("Failed to add points", error.message);
      return { success: false, error: error.message };
    }
  },

  // Get points history
  async getPointsHistory(userId) {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not available");
      }

      debugLog("Getting points history", userId);

      const history = await db
        .select()
        .from(pointsHistory)
        .where(eq(pointsHistory.userId, userId))
        .orderBy(desc(pointsHistory.createdAt));

      debugLog("Points history retrieved", history.length + " entries");
      return { success: true, history };
    } catch (error) {
      debugLog("Failed to get points history", error.message);
      return { success: false, error: error.message };
    }
  },
};

// Database Check-in Service
export const dbCheckinService = {
  // Check if user can check in today
  async canCheckIn(userId) {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not available");
      }

      debugLog("Checking if user can check in", userId);

      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const [todayCheckIn] = await db
        .select()
        .from(checkIns)
        .where(
          and(
            eq(checkIns.userId, userId),
            gte(checkIns.checkInDate, startOfDay),
            lt(checkIns.checkInDate, endOfDay)
          )
        )
        .limit(1);

      const canCheckIn = !todayCheckIn;
      debugLog("Can check in result", canCheckIn);
      return { success: true, canCheckIn };
    } catch (error) {
      debugLog("Failed to check check-in status", error.message);
      return { success: false, error: error.message };
    }
  },

  // Perform check-in
  async checkIn(userId, pointsToEarn = 10) {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not available");
      }

      debugLog("Performing check-in", { userId, pointsToEarn });

      // Check if already checked in today
      const canCheckInResult = await this.canCheckIn(userId);
      if (!canCheckInResult.success || !canCheckInResult.canCheckIn) {
        return { success: false, error: "Already checked in today" };
      }

      // Perform check-in and add points
      const result = await db.transaction(async (tx) => {
        // Create check-in record
        const [checkInRecord] = await tx
          .insert(checkIns)
          .values({
            userId,
            pointsEarned: pointsToEarn,
          })
          .returning();

        // Add points to user
        const [updatedUser] = await tx
          .update(users)
          .set({
            points: sql`points + ${pointsToEarn}`,
            lastCheckIn: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning();

        // Create points history entry
        const [pointsEntry] = await tx
          .insert(pointsHistory)
          .values({
            userId,
            points: pointsToEarn,
            reason: "Daily Check-in",
            type: "earned",
          })
          .returning();

        return { checkIn: checkInRecord, user: updatedUser, pointsEntry };
      });

      debugLog("Check-in completed successfully", result.checkIn.id);
      return { success: true, ...result };
    } catch (error) {
      debugLog("Failed to perform check-in", error.message);
      return { success: false, error: error.message };
    }
  },
};

// Database service utilities
export const dbService = {
  // Test database connection
  async testConnection() {
    try {
      // Initialize database tables if needed
      await initializeDatabaseTables();

      const result = await testDatabaseConnection();
      debugLog("Database connection test result", result);
      return result;
    } catch (error) {
      debugLog("Database connection test error", error.message);
      return {
        success: false,
        error: error.message,
        type: "postgresql",
      };
    }
  },

  // Check if database is available
  isAvailable() {
    try {
      const available = isDatabaseAvailable();
      debugLog("Database availability check", available);
      return available;
    } catch (error) {
      debugLog("Database availability check error", error.message);
      // If we have a database URL, assume it's available for now
      return !!(
        import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL
      );
    }
  },

  // Get environment info
  getEnvironmentInfo() {
    const hasConnectionString = !!(
      import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL
    );
    const isAvailable = this.isAvailable();
    const envInfo = getDatabaseEnvironmentInfo();

    debugLog("Database environment info", {
      hasConnectionString,
      isAvailable,
      envInfo,
    });

    return {
      isDatabaseAvailable: isAvailable,
      hasConnectionString,
      type: "postgresql",
      ...envInfo,
    };
  },

  // Comprehensive test of all database operations
  async testAllOperations() {
    debugLog("Starting comprehensive database operations test");

    const testResults = {
      success: true,
      tests: {},
      errors: [],
      summary: {},
    };

    try {
      // Test 1: Database initialization
      debugLog("Test 1: Database initialization");
      const initResult = await initializeDatabaseTables();
      testResults.tests.initialization = initResult;
      if (!initResult.success) {
        testResults.success = false;
        testResults.errors.push(`Initialization failed: ${initResult.error}`);
      }

      // Test 2: User creation
      debugLog("Test 2: User creation");
      const testUser = {
        email: `test_${Date.now()}@example.com`,
        name: "Test User",
        password: "testpassword123",
      };

      const createResult = await dbUserService.createUser(testUser);
      testResults.tests.userCreation = createResult;
      if (!createResult.success) {
        testResults.success = false;
        testResults.errors.push(`User creation failed: ${createResult.error}`);
        return testResults; // Can't continue without a user
      }

      const userId = createResult.user.id;
      debugLog("Created test user with ID:", userId);

      // Test 3: User authentication
      debugLog("Test 3: User authentication");
      const authResult = await dbUserService.authenticateUser(
        testUser.email,
        testUser.password
      );
      testResults.tests.authentication = authResult;
      if (!authResult.success) {
        testResults.success = false;
        testResults.errors.push(`Authentication failed: ${authResult.error}`);
      }

      // Test 4: Points operations
      debugLog("Test 4: Points operations");
      const pointsResult = await dbPointsService.addPoints(
        userId,
        50,
        "Test points"
      );
      testResults.tests.pointsAdd = pointsResult;
      if (!pointsResult.success) {
        testResults.success = false;
        testResults.errors.push(`Add points failed: ${pointsResult.error}`);
      }

      // Test 5: Points history
      debugLog("Test 5: Points history");
      const historyResult = await dbPointsService.getPointsHistory(userId);
      testResults.tests.pointsHistory = historyResult;
      if (!historyResult.success) {
        testResults.success = false;
        testResults.errors.push(
          `Points history failed: ${historyResult.error}`
        );
      }

      // Test 6: Check-in operations
      debugLog("Test 6: Check-in operations");
      const canCheckInResult = await dbCheckinService.canCheckIn(userId);
      testResults.tests.canCheckIn = canCheckInResult;
      if (canCheckInResult.success && canCheckInResult.canCheckIn) {
        const checkInResult = await dbCheckinService.checkIn(userId, 10);
        testResults.tests.checkIn = checkInResult;
        if (!checkInResult.success) {
          testResults.success = false;
          testResults.errors.push(`Check-in failed: ${checkInResult.error}`);
        }
      }

      // Test 7: Redemption operations
      debugLog("Test 7: Redemption operations");
      const redeemResult = await dbRedemptionsService.redeemReward(
        userId,
        "test_reward",
        25,
        "Test Reward"
      );
      testResults.tests.redemption = redeemResult;
      if (!redeemResult.success) {
        testResults.success = false;
        testResults.errors.push(`Redemption failed: ${redeemResult.error}`);
      }

      // Test 8: Redemption history
      debugLog("Test 8: Redemption history");
      const redemptionHistoryResult =
        await dbRedemptionsService.getRedemptionHistory(userId);
      testResults.tests.redemptionHistory = redemptionHistoryResult;
      if (!redemptionHistoryResult.success) {
        testResults.success = false;
        testResults.errors.push(
          `Redemption history failed: ${redemptionHistoryResult.error}`
        );
      }

      // Test 9: User update
      debugLog("Test 9: User update");
      const updateResult = await dbUserService.updateUser(userId, {
        name: "Updated Test User",
      });
      testResults.tests.userUpdate = updateResult;
      if (!updateResult.success) {
        testResults.success = false;
        testResults.errors.push(`User update failed: ${updateResult.error}`);
      }

      // Cleanup: Delete test user (optional, for cleaner tests)
      debugLog("Cleaning up test data");
      try {
        const db = getDatabase();
        if (db) {
          await db.delete(users).where(eq(users.id, userId));
          debugLog("Test user cleaned up successfully");
        }
      } catch (cleanupError) {
        debugLog("Cleanup failed (non-critical)", cleanupError.message);
      }

      // Generate summary
      const passedTests = Object.values(testResults.tests).filter(
        (test) => test.success
      ).length;
      const totalTests = Object.keys(testResults.tests).length;

      testResults.summary = {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        successRate: `${Math.round((passedTests / totalTests) * 100)}%`,
      };

      debugLog("Database operations test completed", testResults.summary);
      return testResults;
    } catch (error) {
      debugLog("Database operations test failed with error", error.message);
      testResults.success = false;
      testResults.errors.push(`Test suite error: ${error.message}`);
      return testResults;
    }
  },
};

// Database Redemptions Service
export const dbRedemptionsService = {
  // Redeem points for reward
  async redeemReward(userId, rewardId, pointsCost, rewardName) {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not available");
      }

      // Initialize database tables if needed
      await initializeDatabaseTables();

      debugLog("Redeeming reward in database", {
        userId,
        rewardId,
        pointsCost,
      });

      // Start transaction
      return await db.transaction(async (tx) => {
        // Get user and check points
        const [user] = await tx
          .select()
          .from(users)
          .where(eq(users.id, userId));

        if (!user) {
          throw new Error("User not found");
        }

        if (user.points < pointsCost) {
          throw new Error("Insufficient points");
        }

        // Create redemption record
        const [redemption] = await tx
          .insert(redemptions)
          .values({
            userId,
            rewardId,
            rewardName,
            pointsCost,
            status: "redeemed",
          })
          .returning();

        // Update user points
        const [updatedUser] = await tx
          .update(users)
          .set({
            points: user.points - pointsCost,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning();

        debugLog("Reward redeemed successfully", redemption.id);
        return {
          success: true,
          user: updatedUser,
          redemption,
        };
      });
    } catch (error) {
      debugLog("Failed to redeem reward", error.message);
      return { success: false, error: error.message };
    }
  },

  // Get redemption history for user
  async getRedemptionHistory(userId) {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not available");
      }

      debugLog("Getting redemption history from database", userId);

      const userRedemptions = await db
        .select()
        .from(redemptions)
        .where(eq(redemptions.userId, userId))
        .orderBy(desc(redemptions.createdAt));

      debugLog("Retrieved redemption history", userRedemptions.length);
      return { success: true, history: userRedemptions };
    } catch (error) {
      debugLog("Failed to get redemption history", error.message);
      return { success: false, error: error.message };
    }
  },
};
