import axios from "axios";

const API_URL = "http://localhost:8000";

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

export const googleLogin = () => {
  window.location.href = `${API_URL}/auth/google/login`;
};

export const fetchUserInfo = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  const response = await axios.get(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
