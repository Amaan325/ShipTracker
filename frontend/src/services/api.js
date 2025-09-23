// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:9700/api",
  withCredentials: true,
});

// Ports
export const getPorts = () => API.get("/ports/");
export const getEngineers = () => API.get("/engineers");
export const addEngineer = (engineer) => API.post("/engineers", engineer);

// Ships
export const addVessel = (vessel) => API.post("/ships", vessel);
export const searchShips = (query) => API.get(`/ships/search?q=${encodeURIComponent(query)}`);
export const getVesselDetails = (mmsi) => API.get(`/vessel-finder/vessel/${mmsi}`);
export const saveOrCheckVessel = (data) => API.post("/vessels/save-or-check", data);
export const deactivateVessel = (mmsi) => API.patch(`/vessels/deactivate/${mmsi}`);
// src/services/api.js
export const getAllVessels = (page = 1, limit = 10) =>
  API.get(`/vessels/getVessels?page=${page}&limit=${limit}`);
// src/services/api.js
export const getAllVesselsForMap = () => API.get("/vessels/getAllForMap");
