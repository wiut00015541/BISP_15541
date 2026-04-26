// optionsService keeps related frontend API calls in one place.
import api from "./api";

// Fetch options from the backend API.
export const fetchOptions = async (type) => {
  const { data } = await api.get(`/options/${type}`);
  return data;
};

// Create option through the backend API.
export const createOption = async (type, payload) => {
  const { data } = await api.post(`/options/${type}`, payload);
  return data;
};

// Update option through the backend API.
export const updateOption = async (type, id, payload) => {
  const { data } = await api.patch(`/options/${type}/${id}`, payload);
  return data;
};

// Delete option through the backend API.
export const deleteOption = async (type, id) => {
  await api.delete(`/options/${type}/${id}`);
};
