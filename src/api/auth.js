import axios from "axios";

const API_URL = "http://localhost:8000";

export const registerUser = async (form) => {
  const response = await axios.post(`${API_URL}/auth/`, form);
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};