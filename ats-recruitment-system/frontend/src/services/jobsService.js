// jobsService keeps related frontend API calls in one place.
import api from "./api";

// Fetch jobs from the backend API.
export const fetchJobs = async (params) => {
  const { data } = await api.get("/jobs", { params });
  return data;
};

// Fetch job by id from the backend API.
export const fetchJobById = async (id) => {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
};

// Create job through the backend API.
export const createJob = async (payload) => {
  const { data } = await api.post("/jobs", payload);
  return data;
};

// Update job through the backend API.
export const updateJob = async (id, payload) => {
  const { data } = await api.patch(`/jobs/${id}`, payload);
  return data;
};

// Delete job through the backend API.
export const deleteJob = async (id) => {
  await api.delete(`/jobs/${id}`);
};
