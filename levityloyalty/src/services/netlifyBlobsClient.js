// Client-side service for Netlify Blobs via Functions proxy
// This avoids CORS issues by using Netlify Functions as a proxy

// Debug logging
const debugLog = (message, data = "") => {
  if (
    import.meta.env.VITE_ENVIRONMENT === "development" ||
    import.meta.env.DEV
  ) {
    console.log(`[Netlify Blobs Client] ${message}`, data);
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

// Get the base URL for Netlify Functions
const getFunctionsBaseUrl = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/.netlify/functions`;
  }
  return "/.netlify/functions";
};

// Create a Netlify Blobs client that uses Functions proxy
const createNetlifyBlobsClient = (storeName) => {
  debugLog(`Creating Netlify Blobs client for store: ${storeName}`);

  const baseUrl = getFunctionsBaseUrl();

  return {
    async set(key, value) {
      debugLog(`Setting data for key: ${key}`);

      try {
        const response = await fetch(
          `${baseUrl}/blobs-proxy/${storeName}/set/${key}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ value }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to set data");
        }

        const result = await response.json();
        debugLog(`Data set successfully for key: ${key}`);
        return result;
      } catch (error) {
        debugLog(`Failed to set data for key: ${key}`, error.message);
        throw error;
      }
    },

    async get(key, options = {}) {
      debugLog(`Getting data for key: ${key}`);

      try {
        const response = await fetch(
          `${baseUrl}/blobs-proxy/${storeName}/get/${key}`
        );

        if (response.status === 404) {
          debugLog(`Data not found for key: ${key}`);
          return null;
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get data");
        }

        const result = await response.json();
        debugLog(`Data retrieved successfully for key: ${key}`);
        return result.data;
      } catch (error) {
        debugLog(`Failed to get data for key: ${key}`, error.message);
        throw error;
      }
    },

    async delete(key) {
      debugLog(`Deleting data for key: ${key}`);

      try {
        const response = await fetch(
          `${baseUrl}/blobs-proxy/${storeName}/delete/${key}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete data");
        }

        const result = await response.json();
        debugLog(`Data deleted successfully for key: ${key}`);
        return result;
      } catch (error) {
        debugLog(`Failed to delete data for key: ${key}`, error.message);
        throw error;
      }
    },

    async list() {
      debugLog(`Listing data for store: ${storeName}`);

      try {
        const response = await fetch(
          `${baseUrl}/blobs-proxy/${storeName}/list`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to list data");
        }

        const result = await response.json();
        const blobs = result.blobs || [];
        debugLog(
          `Data listed successfully for store: ${storeName}`,
          blobs.length + " items"
        );
        return { blobs: blobs };
      } catch (error) {
        debugLog(`Failed to list data for store: ${storeName}`, error.message);
        throw error;
      }
    },
  };
};

// Fallback to localStorage for development
const createFallbackStore = (storeName) => {
  debugLog(`Creating localStorage fallback for store: ${storeName}`);

  return {
    async set(key, value) {
      debugLog(`LocalStorage SET: ${storeName}_${key}`);
      localStorage.setItem(`${storeName}_${key}`, value);
    },
    async get(key, options = {}) {
      const data = localStorage.getItem(`${storeName}_${key}`);
      debugLog(
        `LocalStorage GET: ${storeName}_${key}`,
        data ? "found" : "not found"
      );
      return data;
    },
    async list() {
      const keys = Object.keys(localStorage)
        .filter((key) => key.startsWith(`${storeName}_`))
        .map((key) => ({ key: key.replace(`${storeName}_`, "") }));
      debugLog(`LocalStorage LIST: ${storeName}`, keys.length + " items");
      return { blobs: keys };
    },
    async delete(key) {
      debugLog(`LocalStorage DELETE: ${storeName}_${key}`);
      localStorage.removeItem(`${storeName}_${key}`);
    },
  };
};

// Store cache to avoid recreating stores
const storeCache = new Map();

// Initialize stores with proper fallback logic
export const getUsersStore = async () => {
  const cacheKey = "users";
  if (storeCache.has(cacheKey)) {
    return storeCache.get(cacheKey);
  }

  let store;
  if (isNetlifyEnvironment()) {
    try {
      store = createNetlifyBlobsClient("users");
      // Test the connection
      await store.list();
      debugLog("Netlify Blobs client created successfully for users store");
    } catch (error) {
      debugLog(
        "Netlify Blobs client failed, using localStorage fallback",
        error.message
      );
      store = createFallbackStore("users");
    }
  } else {
    store = createFallbackStore("users");
  }

  storeCache.set(cacheKey, store);
  return store;
};

export const getPointsStore = async () => {
  const cacheKey = "points-history";
  if (storeCache.has(cacheKey)) {
    return storeCache.get(cacheKey);
  }

  let store;
  if (isNetlifyEnvironment()) {
    try {
      store = createNetlifyBlobsClient("points-history");
      // Test the connection
      await store.list();
      debugLog("Netlify Blobs client created successfully for points store");
    } catch (error) {
      debugLog(
        "Netlify Blobs client failed, using localStorage fallback",
        error.message
      );
      store = createFallbackStore("points-history");
    }
  } else {
    store = createFallbackStore("points-history");
  }

  storeCache.set(cacheKey, store);
  return store;
};

export const getRedemptionsStore = async () => {
  const cacheKey = "redemptions";
  if (storeCache.has(cacheKey)) {
    return storeCache.get(cacheKey);
  }

  let store;
  if (isNetlifyEnvironment()) {
    try {
      store = createNetlifyBlobsClient("redemptions");
      // Test the connection
      await store.list();
      debugLog(
        "Netlify Blobs client created successfully for redemptions store"
      );
    } catch (error) {
      debugLog(
        "Netlify Blobs client failed, using localStorage fallback",
        error.message
      );
      store = createFallbackStore("redemptions");
    }
  } else {
    store = createFallbackStore("redemptions");
  }

  storeCache.set(cacheKey, store);
  return store;
};
