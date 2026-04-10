import api from "./api";

export const fetchOptions = async (type) => {
  const { data } = await api.get(`/options/${type}`);
  return data;
};

export const createOption = async (type, payload) => {
  const { data } = await api.post(`/options/${type}`, payload);
  return data;
};

export const updateOption = async (type, id, payload) => {
  const { data } = await api.patch(`/options/${type}/${id}`, payload);
  return data;
};

export const deleteOption = async (type, id) => {
  await api.delete(`/options/${type}/${id}`);
};
