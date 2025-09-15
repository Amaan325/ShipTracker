// src/components/ShipMap/ShipMapAll.jsx
import React, { useMemo } from "react";
import { MapContainer, TileLayer, Tooltip, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { createShipIcon, createPortDivIcon } from "../ShipMap/icons";
import { isValidCoordinate, normalizeRotation } from "../ShipMap/utils";
import ShipMarker from "../ShipMap/ShipMarker";
import PortMarker from "../ShipMap/PortMarker";

const ICON_ROTATION_OFFSET = 0;

// Hardcoded ports with unique colors
const HARD_PORTS = [
  {
    name: "Port of Antwerp",
    unlocode: "BEANR",
    lat: 51.24103401137098,
    lng: 4.40776674956587,
    color: "#f6c600", // Yellow
    radius: 45000,
  },
  {
    name: "Port of Zeebrugge",
    unlocode: "BEZEE",
    lat: 51.32590353698185,
    lng: 3.2171386811590987,
    color: "#2ecc71", // Green
    radius: 45000,
  },
  {
    name: "Port of Rotterdam",
    unlocode: "NLRTM",
    lat: 51.9049101785398,
    lng: 4.484615869557539,
    color: "#3498db", // Blue
    radius: 45000,
  },
];

const ShipMapAll = React.memo(function ShipMapAll({ vessels = [] }) {
  const portIcon = useMemo(() => createPortDivIcon(), []);

  // Default center (first valid vessel or Antwerp)
  const firstValid = vessels.find(
    (v) => isValidCoordinate(v.latitude) && isValidCoordinate(v.longitude)
  );
  const defaultCenter = firstValid
    ? [Number(firstValid.latitude), Number(firstValid.longitude)]
    : [51.24103401137098, 4.40776674956587];

  return (
    <div className="relative">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        scrollWheelZoom
        className="map-container h-[500px] w-full rounded-2xl overflow-hidden mb-6"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={3}
        />

        {/* Render all vessels */}
        {vessels.map((vessel) => {
          if (!isValidCoordinate(vessel.latitude) || !isValidCoordinate(vessel.longitude))
            return null;

          const rotationRaw = vessel.heading ?? vessel.COG ?? 0;
          const rotation = normalizeRotation(rotationRaw, ICON_ROTATION_OFFSET);
          const shipIcon = createShipIcon(rotation);

          return (
            <ShipMarker
              key={vessel._id}
              lat={Number(vessel.latitude)}
              lng={Number(vessel.longitude)}
              mmsi={vessel.mmsi}
              icon={shipIcon}
              destination={vessel.destination ? { name: vessel.destination } : null}
              shipName={vessel.name}
              heading={rotationRaw}
              COG={vessel.COG}
            >
             <Popup>
  <div>
    <strong>{vessel.name}</strong> <br />
    MMSI: {vessel.mmsi || "-"} <br />
    Destination: {vessel.destination?.trim() || "Not available"} <br />
    Speed: {vessel.sog || "-"} kn
  </div>
</Popup>
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                {vessel.name}
              </Tooltip>
            </ShipMarker>
          );
        })}

        {/* Render hardcoded ports with custom colors */}
        {HARD_PORTS.map((port) => (
          <React.Fragment key={port.unlocode}>
            <PortMarker port={port} icon={portIcon}>
              <Popup>
                <div>
                  <strong>{port.name}</strong> <br />
                  UN/LOCODE: {port.unlocode}
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                {port.name}
              </Tooltip>
            </PortMarker>

            {/* Colored radius */}
            <Circle
              center={[port.lat, port.lng]}
              radius={port.radius}
              pathOptions={{
                color: port.color,
                fillColor: port.color,
                fillOpacity: 0.2,
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Top-right legend */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 shadow-md rounded-lg p-3 text-sm z-[1000]">
        <h4 className="font-semibold mb-2">Ports</h4>
        <ul className="space-y-1">
          {HARD_PORTS.map((port) => (
            <li key={port.unlocode} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: port.color }}
              ></span>
              {port.name} ({port.unlocode})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default ShipMapAll;
