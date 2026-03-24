import api from "./api";

export const scheduleInterview = async (applicationId, payload) => {
  const { data } = await api.post(`/applications/${applicationId}/interviews`, payload);
  return data;
};

export const addInterviewFeedback = async (interviewId, payload) => {
  const { data } = await api.post(`/applications/interviews/${interviewId}/feedback`, payload);
  return data;
};
