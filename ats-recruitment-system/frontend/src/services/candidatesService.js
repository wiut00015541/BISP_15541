import api from "./api";

export const fetchCandidates = async (params) => {
  const { data } = await api.get("/candidates", { params });
  return data;
};

export const fetchCandidateById = async (id) => {
  const { data } = await api.get(`/candidates/${id}`);
  return data;
};

export const createCandidate = async (payload) => {
  const { data } = await api.post("/candidates", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateCandidate = async (id, payload) => {
  const { data } = await api.patch(`/candidates/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteCandidate = async (id) => {
  await api.delete(`/candidates/${id}`);
};
