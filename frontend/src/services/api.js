// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:9700/api",
  withCredentials: true,
});

// Ports
export const getPorts = () => API.get("/ports/");

//Engineers
export const getEngineers = () => API.get("/engineers");
export const addEngineer = (engineer) => API.post("/engineers", engineer);
export const updateEngineer = (id, data) =>
  API.put(`/engineers/update/${id}`, data);
export const deleteEngineer = (id) => API.delete(`/engineers/delete/${id}`);

// Ships
export const addVessel = (vessel) => API.post("/ships", vessel);
export const searchShips = (query) =>
  API.get(`/ships/search?q=${encodeURIComponent(query)}`);
export const getVesselDetails = (mmsi) =>
  API.get(`/vessel-finder/vessel/${mmsi}`);
export const saveOrCheckVessel = (data) =>
  API.post("/vessels/save-or-check", data);
export const deactivateVessel = (mmsi) =>
  API.patch(`/vessels/deactivate/${mmsi}`);
// src/services/api.js
export const getAllVessels = (page = 1, limit = 10) =>
  API.get(`/vessels/getVessels?page=${page}&limit=${limit}`);
// src/services/api.js
export const getAllVesselsForMap = () => API.get("/vessels/getAllForMap");
export const getAllCompletedVessels = (page = 1, limit = 10) =>
  API.get(`/vessels/getAllCompletedVessels?page=${page}&limit=${limit}`);
export const deleteVessel = (id) => API.delete(`/vessels/delete/${id}`);
// 📊 API Statistics
export const getApiStats = (from, to) => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  return API.get("/stats", { params });
};

// ✅ WhatsApp
export const getWhatsAppStatus = () => API.get("/whatsapp/status");
