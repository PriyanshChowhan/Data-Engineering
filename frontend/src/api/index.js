import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
});

const unwrap = async (request) => {
  const { data } = await request;
  return data;
};

export const dashboardApi = {
  getStats: () => unwrap(api.get("/dashboard/stats"))
};

export const propertiesApi = {
  list: (params) => unwrap(api.get("/properties", { params })),
  getById: (id) => unwrap(api.get(`/properties/${id}`)),
  searchText: (params) => unwrap(api.get("/properties/search/text", { params })),
  create: (payload) => unwrap(api.post("/properties", payload)),
  update: (id, payload) => unwrap(api.put(`/properties/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/properties/${id}`))
};

export const queriesApi = {
  list: () => unwrap(api.get("/queries")),
  run: (queryId) => unwrap(api.get(`/queries/${queryId}`)),
  insights: () => unwrap(api.get("/queries/insights"))
};

export default api;
