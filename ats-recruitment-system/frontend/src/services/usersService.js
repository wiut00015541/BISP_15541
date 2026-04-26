// usersService keeps related frontend API calls in one place.
import api from "./api";

// Fetch users from the backend API.
export const fetchUsers = async (params) => {
  const { data } = await api.get("/users", { params });
  return data;
};

// Fetch current user from the backend API.
export const fetchCurrentUser = async () => {
  const { data } = await api.get("/users/me");
  return data;
};

// Create user through the backend API.
export const createUser = async (payload) => {
  const { data } = await api.post("/users", payload);
  return data;
};

// Update current user through the backend API.
export const updateCurrentUser = async (payload) => {
  const { data } = await api.patch("/users/me", payload);
  return data;
};

// Refresh the stored user profile without replacing the current token.
export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data;
};

// Keep this API request reusable across the frontend.
export const toggleUserStatus = async (id) => {
  const { data } = await api.patch(`/users/${id}/status`);
  return data;
};

// Delete user through the backend API.
export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};
