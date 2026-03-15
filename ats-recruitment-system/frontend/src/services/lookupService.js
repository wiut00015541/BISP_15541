import api from "./api";

export const fetchLookups = async () => {
  const { data } = await api.get("/lookups");
  return data;
};
