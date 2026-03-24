import api from "./api";

export const fetchUsers = async (params) => {
  const { data } = await api.get("/users", { params });
  return data;
};

export const createUser = async (payload) => {
  const { data } = await api.post("/users", payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data;
};

export const toggleUserStatus = async (id) => {
  const { data } = await api.patch(`/users/${id}/status`);
  return data;
};

export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};
