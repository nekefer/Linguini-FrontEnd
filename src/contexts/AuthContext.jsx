import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { fetchUserInfo, logoutUser, refreshToken } from "../api/auth";

const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component to wrap the app and provide auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [googleTokensValid, setGoogleTokensValid] = useState(false); // ✅ NEW: Track Google token status

  // Check if user is authenticated on app start
  const checkAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Checking authentication...");
      const userData = await fetchUserInfo();
      console.log("✅ User authenticated:", userData);
      setUser(userData);

      // ✅ NEW: Check if Google tokens are still valid
      try {
        const refreshResponse = await refreshToken();
        setGoogleTokensValid(refreshResponse.google_tokens_valid || false);
        console.log(
          "🔑 Google tokens valid:",
          refreshResponse.google_tokens_valid
        );
      } catch {
        setGoogleTokensValid(false);
      }
    } catch (error) {
      console.log("❌ Not authenticated:", error.response?.status);

      // If 401, try to refresh token
      if (error.response?.status === 401) {
        try {
          console.log("🔄 Trying to refresh token...");
          const refreshResponse = await refreshToken();
          setGoogleTokensValid(refreshResponse.google_tokens_valid || false);

          // Retry getting user info
          const userData = await fetchUserInfo();
          setUser(userData);
          console.log("✅ Token refreshed, user authenticated");
        } catch (refreshError) {
          console.log("❌ Token refresh failed", refreshError);
          setUser(null);
          setGoogleTokensValid(false);
        }
      } else {
        setUser(null);
        setGoogleTokensValid(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setError(null);
    // ✅ NEW: Assume Google tokens are valid after fresh login
    setGoogleTokensValid(true);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setError(null);
      setGoogleTokensValid(false); // ✅ NEW: Clear Google token status
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
    googleTokensValid, // ✅ NEW: Expose to components
    setGoogleTokensValid, // ✅ NEW: Allow manual updates
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
