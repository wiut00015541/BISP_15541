import api from "./api";

export const fetchDepartments = async () => {
  const { data } = await api.get("/departments");
  return data;
};

export const createDepartment = async (payload) => {
  const { data } = await api.post("/departments", payload);
  return data;
};

export const updateDepartment = async (id, payload) => {
  const { data } = await api.patch(`/departments/${id}`, payload);
  return data;
};

export const deleteDepartment = async (id) => {
  await api.delete(`/departments/${id}`);
};
