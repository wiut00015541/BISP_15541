// applicationsService keeps related frontend API calls in one place.
import api from "./api";

// Fetch applications from the backend API.
export const fetchApplications = async (params) => {
  const { data } = await api.get("/applications", { params });
  return data;
};

// Create a new application for an existing candidate.
export const createApplication = async (payload) => {
  const { data } = await api.post("/applications", payload);
  return data;
};

// Update application stage through the backend API.
export const updateApplicationStage = async (id, stage, note) => {
  const { data } = await api.patch(`/applications/${id}/stage`, { stage, note });
  return data;
};

// Keep this API request reusable across the frontend.
export const revertHiredApplication = async (id) => {
  const { data } = await api.patch(`/applications/${id}/revert-hired`);
  return data;
};
