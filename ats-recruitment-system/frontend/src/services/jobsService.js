import api from "./api";

export const fetchJobs = async (params) => {
  const { data } = await api.get("/jobs", { params });
  return data;
};

export const createJob = async (payload) => {
  const { data } = await api.post("/jobs", payload);
  return data;
};
