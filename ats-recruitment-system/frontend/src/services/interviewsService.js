// interviewsService keeps related frontend API calls in one place.
import api from "./api";

// Keep this API request reusable across the frontend.
export const scheduleInterview = async (applicationId, payload) => {
  const { data } = await api.post(`/applications/${applicationId}/interviews`, payload);
  return data;
};

// Keep this API request reusable across the frontend.
export const addInterviewFeedback = async (interviewId, payload) => {
  const { data } = await api.post(`/applications/interviews/${interviewId}/feedback`, payload);
  return data;
};
