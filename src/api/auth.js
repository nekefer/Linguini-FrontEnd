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

// 🎯 Unified Google OAuth - automatically handles registration and login
export const googleLogin = () => {
  window.location.href = `${API_URL}/auth/google/login`;
};

export const googleRegister = () => {
  window.location.href = `${API_URL}/auth/google/login`;
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

// ✅ Add refresh token function
export const refreshToken = async () => {
  const response = await axios.post(`${API_URL}/auth/refresh`);
  return response.data;
};

// ✅ SECURE: Fetch last liked video - backend reads Google token from HttpOnly cookie
export const getLastLikedVideo = async () => {
  const response = await axios.get(`${API_URL}/youtube/last-liked-video`);
  return response.data;
};
