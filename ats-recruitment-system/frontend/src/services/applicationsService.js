import api from "./api";

export const fetchApplications = async (params) => {
  const { data } = await api.get("/applications", { params });
  return data;
};

export const updateApplicationStage = async (id, stage, note) => {
  const { data } = await api.patch(`/applications/${id}/stage`, { stage, note });
  return data;
};

export const revertHiredApplication = async (id) => {
  const { data } = await api.patch(`/applications/${id}/revert-hired`);
  return data;
};
