import api from "./api";

export const fetchHiringFunnelReport = async () => {
  const { data } = await api.get("/reports/hiring-funnel");
  return data;
};
