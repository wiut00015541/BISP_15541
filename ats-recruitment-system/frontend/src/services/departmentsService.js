// departmentsService keeps related frontend API calls in one place.
import api from "./api";

// Fetch departments from the backend API.
export const fetchDepartments = async () => {
  const { data } = await api.get("/departments");
  return data;
};

// Create department through the backend API.
export const createDepartment = async (payload) => {
  const { data } = await api.post("/departments", payload);
  return data;
};

// Update department through the backend API.
export const updateDepartment = async (id, payload) => {
  const { data } = await api.patch(`/departments/${id}`, payload);
  return data;
};

// Delete department through the backend API.
export const deleteDepartment = async (id) => {
  await api.delete(`/departments/${id}`);
};
