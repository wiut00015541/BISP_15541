import api from "./api";

export const fetchDashboardOverview = async () => {
  const { data } = await api.get("/dashboard/overview");
  return data;
};
