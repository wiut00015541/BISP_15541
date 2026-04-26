// candidatesService keeps related frontend API calls in one place.
import api from "./api";

// Fetch candidates from the backend API.
export const fetchCandidates = async (params) => {
  const { data } = await api.get("/candidates", { params });
  return data;
};

// Fetch candidate by id from the backend API.
export const fetchCandidateById = async (id) => {
  const { data } = await api.get(`/candidates/${id}`);
  return data;
};

// Create candidate through the backend API.
export const createCandidate = async (payload) => {
  const { data } = await api.post("/candidates", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Update candidate through the backend API.
export const updateCandidate = async (id, payload) => {
  const { data } = await api.patch(`/candidates/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Delete candidate through the backend API.
export const deleteCandidate = async (id) => {
  await api.delete(`/candidates/${id}`);
};

// Keep this API request reusable across the frontend.
export const addCandidateReview = async (candidateId, payload) => {
  const { data } = await api.post(`/candidates/${candidateId}/notes`, payload);
  return data;
};

// Keep this API request reusable across the frontend.
export const sendCandidateCommunication = async (candidateId, payload) => {
  const { data } = await api.post(`/candidates/${candidateId}/communications`, payload);
  return data;
};

// Keep this API request reusable across the frontend.
export const analyzeCandidateResume = async (candidateId, resumeId) => {
  const { data } = await api.post(`/candidates/${candidateId}/resumes/${resumeId}/analyze`);
  return data;
};
