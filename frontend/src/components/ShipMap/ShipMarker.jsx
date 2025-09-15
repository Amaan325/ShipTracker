// src/components/ShipMap/ShipMarker.jsx
import React from "react";
import { Marker, Tooltip, Popup } from "react-leaflet";
import AutoFollow from "./AutoFollow";

const ShipMarker = ({ lat, lng, icon, mmsi, shipName, heading, COG, destination, sog }) => (
  <>
    <AutoFollow lat={lat} lng={lng} enabled />
    <Marker position={[lat, lng]} icon={icon}>
      {/* Permanent Mini Label */}
      <Tooltip
        permanent
        direction="top"
        offset={[0, -10]}
        opacity={1}
        className="ship-tooltip-name"
      >
        <span style={{ fontSize: "12px", fontWeight: "600", color: "#333" }}>
          {shipName || "Unknown"}
        </span>
      </Tooltip>

      {/* Hover Card (instead of click) */}
      <Popup className="ship-popup">
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.5em",
            minWidth: "180px",
            padding: "6px 10px",
            borderRadius: "8px",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "6px",
              fontWeight: "bold",
              textAlign: "center",
              color: "#222",
            }}
          >
            🚢 {shipName ?? "Ship"}
          </h3>
          <p><strong>MMSI:</strong> {mmsi || "—"}</p>
          <p><strong>Destination:</strong> {destination?.name || "—"}</p>
          <p><strong>Speed:</strong> {sog || "—"} kn</p>
        </div>
      </Popup>
    </Marker>
  </>
);

export default ShipMarker;
