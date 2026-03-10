import api from "./api";

export const fetchCandidates = async (params) => {
  const { data } = await api.get("/candidates", { params });
  return data;
};

export const createCandidate = async (payload) => {
  const { data } = await api.post("/candidates", payload);
  return data;
};
