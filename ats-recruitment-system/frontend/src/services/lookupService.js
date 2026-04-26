// lookupService keeps related frontend API calls in one place.
import api from "./api";

// Fetch lookups from the backend API.
export const fetchLookups = async () => {
  const { data } = await api.get("/lookups");
  return data;
};
