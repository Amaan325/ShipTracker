import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:9700/api",
  withCredentials: true, // since you enabled credentials in CORS
});
// Ports
export const getPorts = () => API.get("/ports/");

// Engineers
export const getEngineers = () => API.get("/engineers");
export const addEngineer = (engineer) => API.post("/engineers", engineer);

// Ships
export const addVessel = (vessel) => API.post("/ships", vessel);

export const searchShips = (query) => API.get(`/ships/search?q=${query}`);

// services/api.js
export const getVesselDetails = (mmsi) => {
  return API.get(`/vessel-finder/vessel/${mmsi}`); // Your Vessel Finder API endpoint
};

export const saveOrCheckVessel = (data) =>
  API.post("/vessels/save-or-check", data);

export const deactivateVessel = (mmsi) =>
  console.log("Deactivating vessel with MMSI:", mmsi) ||
  API.patch(`/vessels/deactivate/${mmsi}`);