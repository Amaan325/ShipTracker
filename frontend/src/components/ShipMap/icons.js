// src/components/ShipMap/icons.js
import L from "leaflet";

// Ship icon (PNG in public folder)
export const createShipIcon = () => {
  return L.icon({
    iconUrl: "/cargo-ship.png", // make sure this file exists in public folder
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Radar-style port icon
export const createPortDivIcon = () => {
  return L.divIcon({
    html: `
      <div class="radar-container">
        <div class="radar-circle"></div>
        <div class="radar-pulse"></div>
        <div class="radar-pulse delay-1"></div>
        <div class="radar-pulse delay-2"></div>
        <div class="port-center">⚓</div>
      </div>
    `,
    className: "radar-port-marker",
    iconSize: [60, 60],
    iconAnchor: [30, 30],
  });
};
