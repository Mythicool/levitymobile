import { createContext, useContext, useState, useEffect } from "react";
import { userService } from "../services/hybridDataService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedUserId = localStorage.getItem("levity_user_id");
    if (savedUserId) {
      // Try to load user from Netlify Blobs
      loadUserFromCloud(savedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserFromCloud = async (userId) => {
    try {
      const result = await userService.getUserById(userId);
      if (result.success) {
        setUser(result.user);
      } else {
        // If user not found in cloud, clear local storage
        localStorage.removeItem("levity_user_id");
      }
    } catch (error) {
      console.error("Error loading user from cloud:", error);
      localStorage.removeItem("levity_user_id");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await userService.authenticateUser(email, password);

      if (result.success) {
        setUser(result.user);
        localStorage.setItem("levity_user_id", result.user.id);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);

      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser.success) {
        return { success: false, error: "User with this email already exists" };
      }

      // Create new user
      const result = await userService.createUser({ name, email, password });

      if (result.success) {
        const { password: _, ...userWithoutPassword } = result.user;
        setUser(userWithoutPassword);
        localStorage.setItem("levity_user_id", result.user.id);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("levity_user_id");
  };

  const updateUser = async (updates) => {
    try {
      if (!user) return { success: false, error: "No user logged in" };

      const result = await userService.updateUser(user.id, updates);
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const result = await userService.getUserById(user.id);
      if (result.success) {
        setUser(result.user);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
