// authService keeps related frontend API calls in one place.
import api from "./api";

// Send login credentials to the backend and return the auth payload.
export const login = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

// Keep this API request reusable across the frontend.
export const register = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};
