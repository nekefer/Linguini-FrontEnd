import axios from "axios";

const API_URL = "http://localhost:8000";

// ✅ Configure axios to send cookies automatically
axios.defaults.withCredentials = true;

export const registerUser = async (form) => {
  const response = await axios.post(`${API_URL}/auth/`, form);
  return response.data;
};

// Update loginUser to use form-urlencoded as required by OAuth2PasswordRequestForm
export const loginUser = async (email, password) => {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);
  const response = await axios.post(`${API_URL}/auth/token`, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};

// ✅ Google OAuth with intent parameter
export const googleLogin = () => {
  window.location.href = `${API_URL}/auth/google/login?intent=login`;
};

export const googleRegister = () => {
  window.location.href = `${API_URL}/auth/google/login?intent=register`;
};

// ✅ Updated to use cookies instead of localStorage
export const fetchUserInfo = async () => {
  const response = await axios.get(`${API_URL}/auth/me`);
  return response.data;
};

// ✅ Add logout function
export const logoutUser = async () => {
  const response = await axios.post(`${API_URL}/auth/logout`);
  return response.data;
};

// ✅ Add refresh token function - FIXED: removed redirect to prevent infinite loop
export const refreshToken = async () => {
  const response = await axios.post(`${API_URL}/auth/refresh`);
  return response.data;
};

// ✅ Google session detection - improved to prevent multiple calls
let googleCheckInProgress = false;
export const checkGoogleSignInState = async () => {
  // Prevent multiple simultaneous checks
  if (googleCheckInProgress) {
    return false;
  }

  googleCheckInProgress = true;

  try {
    // Get Google client ID from backend
    const clientId = await getGoogleClientId();
    if (!clientId) {
      return false;
    }

    // Check if Google Identity Services is available
    if (typeof window.google !== "undefined" && window.google.accounts) {
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: () => {}, // We don't need a callback for just checking state
      });

      // Check if user is already signed in
      return new Promise((resolve) => {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            resolve(false); // No Google session
          } else {
            resolve(true); // Google session exists
          }
        });
      });
    } else {
      // Google Identity Services not loaded yet
      return new Promise((resolve) => {
        setTimeout(async () => {
          const result = await checkGoogleSignInState();
          resolve(result);
        }, 100);
      });
    }
  } catch (error) {
    console.error("Error checking Google sign-in state:", error);
    return false;
  } finally {
    googleCheckInProgress = false;
  }
};

// ✅ Get Google Client ID from backend
export const getGoogleClientId = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/google/client-id`);
    return response.data.client_id;
  } catch (error) {
    console.error("Failed to get Google client ID:", error);
    return null;
  }
};
