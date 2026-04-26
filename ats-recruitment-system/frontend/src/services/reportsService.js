// reportsService keeps related frontend API calls in one place.
import api from "./api";

// Fetch hiring funnel report from the backend API.
export const fetchHiringFunnelReport = async () => {
  const { data } = await api.get("/reports/hiring-funnel");
  return data;
};
