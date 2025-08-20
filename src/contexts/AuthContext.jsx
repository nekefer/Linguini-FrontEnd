import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { fetchUserInfo, refreshToken } from "../api/auth";
import { handleOAuthRedirect } from "../utils/authUtils";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authCheckInProgress = useRef(false);

  const checkAuth = async () => {
    // Prevent multiple simultaneous auth checks
    if (authCheckInProgress.current) {
      return;
    }

    authCheckInProgress.current = true;

    try {
      const userData = await fetchUserInfo();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      if (err.response?.status === 401) {
        // Try to refresh token
        try {
          await refreshToken();
          const userData = await fetchUserInfo();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (refreshErr) {
          console.log("Token refresh failed, user not authenticated");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log("Authentication check failed:", err);
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
      authCheckInProgress.current = false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // First check if we're returning from OAuth
      await handleOAuthRedirect(updateUser);

      // Then check regular authentication
      await checkAuth();
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    checkAuth,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
