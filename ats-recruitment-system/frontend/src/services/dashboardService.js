// dashboardService keeps related frontend API calls in one place.
import api from "./api";

// Fetch dashboard overview from the backend API.
export const fetchDashboardOverview = async () => {
  const { data } = await api.get("/dashboard/overview");
  return data;
};
