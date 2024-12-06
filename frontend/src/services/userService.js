import axios from "axios";

const API_URL = "http://localhost:3350/api/user";

// Get the profile data
export const getUserProfile = async () => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Update user profile
export const updateUserProfile = async (data) => {
  const token = localStorage.getItem("authToken");
  const response = await axios.put(`${API_URL}/profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Change user password
export const changePassword = async (password) => {
  const token = localStorage.getItem("authToken");
  const response = await axios.put(
    `${API_URL}/change-password`,
    { password },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Delete user profile
export const deleteUserProfile = async () => {
  const token = localStorage.getItem("authToken");
  const response = await axios.delete(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
