// src/components/ShipMap/icons.js
import L from "leaflet";

// Ship icon (PNG in public folder)
export const createShipIcon = () => {
  return L.icon({
    iconUrl: `${import.meta.env.BASE_URL}cargo-ship.png`, // correct path in both dev & prod
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};


// Example: smaller ship icon
// export const createShipIcon = (rotation = 0) => {
//   return L.divIcon({
//     html: `<div style="
//       transform: rotate(${rotation}deg);
//       width: 16px; height: 16px;
//       background: #3498db;
//       border-radius: 50%;
//       border: 2px solid white;
//       box-shadow: 0 0 4px rgba(0,0,0,0.3);
//     "></div>`,
//     iconSize: [16, 16],
//     className: "",
//   });
// };



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
