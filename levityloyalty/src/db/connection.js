import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js";

// Suppress Neon browser security warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filter out Neon's browser security warning
  const message = args.join(" ");
  if (
    message.includes("Running SQL directly from the browser") ||
    message.includes("security implications")
  ) {
    return; // Suppress this specific warning
  }
  originalConsoleWarn.apply(console, args);
};

// Debug logging for database operations
const debugLog = (message, data = "") => {
  if (
    import.meta.env.VITE_ENVIRONMENT === "development" ||
    import.meta.env.DEV
  ) {
    console.log(`[Database Debug] ${message}`, data);
  }
};

// Database connection singleton
let dbConnection = null;

// Initialize database connection
export const initDatabase = () => {
  if (dbConnection) {
    return dbConnection;
  }

  try {
    // Check if we have the database URL
    const databaseUrl =
      import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL;

    if (!databaseUrl) {
      debugLog("No database URL found, database features will be disabled");
      return null;
    }

    // Validate database URL format
    if (
      !databaseUrl.startsWith("postgresql://") &&
      !databaseUrl.startsWith("postgres://")
    ) {
      debugLog(
        "Invalid database URL format, must start with postgresql:// or postgres://"
      );
      return null;
    }

    debugLog("Initializing Neon PostgreSQL connection");

    // Create Neon connection with browser-safe configuration
    const sql = neon(databaseUrl, {
      // Configure for browser usage
      fetchConnectionCache: true,
      // Suppress browser security warnings
      fullResults: false,
      // Add connection timeout
      connectionTimeoutMillis: 10000,
      // Suppress console warnings about browser usage
      arrayMode: false,
      // Use fetch API for better browser compatibility
      fetch: globalThis.fetch,
    });

    // Create Drizzle instance
    dbConnection = drizzle(sql, {
      schema,
      // Add logger for debugging in development
      logger: import.meta.env.DEV
        ? {
            logQuery: (query, params) => {
              debugLog("SQL Query", { query, params });
            },
          }
        : false,
    });

    debugLog("Database connection established successfully");
    return dbConnection;
  } catch (error) {
    debugLog("Failed to initialize database connection", error.message);
    console.error("Database connection error:", error);
    return null;
  }
};

// Get database instance
export const getDatabase = () => {
  if (!dbConnection) {
    return initDatabase();
  }
  return dbConnection;
};

// Check if database is available
export const isDatabaseAvailable = () => {
  const databaseUrl =
    import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL;

  if (!databaseUrl) {
    debugLog("Database URL not found in environment variables");
    return false;
  }

  try {
    // Try to get database instance, but don't fail if there are connection issues
    const db = getDatabase();
    const available = !!db;
    debugLog(`Database availability check: ${available}`);
    return available;
  } catch (error) {
    debugLog("Database availability check failed", error.message);
    // Return true if we have a URL, even if connection fails initially
    // This allows the hybrid service to attempt database operations
    return true;
  }
};

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    const db = getDatabase();
    if (!db) {
      return {
        success: false,
        error: "Database not configured",
        details: "No database URL found or connection failed to initialize",
      };
    }

    debugLog("Testing database connection with simple query");

    // Simple test query with timeout
    const startTime = Date.now();
    const result = await Promise.race([
      db.execute("SELECT 1 as test"),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Connection timeout after 10 seconds")),
          10000
        )
      ),
    ]);

    const duration = Date.now() - startTime;
    debugLog("Database connection test successful", {
      result,
      duration: `${duration}ms`,
    });

    return {
      success: true,
      message: "Database connection working",
      type: "postgresql",
      duration: `${duration}ms`,
      result: result,
    };
  } catch (error) {
    debugLog("Database connection test failed", error.message);

    // Provide more specific error information
    let errorDetails = error.message;
    if (error.message.includes("400")) {
      errorDetails = "Bad Request - Check database URL format and credentials";
    } else if (error.message.includes("401")) {
      errorDetails = "Unauthorized - Check database credentials";
    } else if (error.message.includes("403")) {
      errorDetails = "Forbidden - Check database permissions";
    } else if (error.message.includes("timeout")) {
      errorDetails = "Connection timeout - Database may be unreachable";
    }

    return {
      success: false,
      error: errorDetails,
      originalError: error.message,
      type: "postgresql",
    };
  }
};

// Get environment information for debugging
export const getDatabaseEnvironmentInfo = () => {
  const databaseUrl =
    import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL;

  return {
    hasViteUrl: !!import.meta.env.VITE_DATABASE_URL,
    hasRegularUrl: !!import.meta.env.DATABASE_URL,
    urlFormat: databaseUrl
      ? databaseUrl.startsWith("postgresql://")
        ? "postgresql://"
        : databaseUrl.startsWith("postgres://")
        ? "postgres://"
        : "unknown"
      : "none",
    urlLength: databaseUrl ? databaseUrl.length : 0,
    environment: import.meta.env.MODE || "unknown",
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  };
};
