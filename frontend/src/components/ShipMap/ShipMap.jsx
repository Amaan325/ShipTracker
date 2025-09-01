// src/components/ShipMap/ShipMap.jsx
import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import AutoFollow from "./AutoFollow";
import { createShipIcon, createPortDivIcon } from "./icons";
import { isValidCoordinate, processPorts, normalizeRotation } from "./utils";

const ICON_ROTATION_OFFSET = 0;

const ShipMap = React.memo(function ShipMap({
  latitude,
  longitude,
  name,
  COG,
  heading,
  zoom = 10,
  ports = [],
}) {
  const lat = latitude == null ? null : Number(latitude);
  const lng = longitude == null ? null : Number(longitude);
  const rotationRaw = heading ?? COG ?? 0;
  const rotation = normalizeRotation(rotationRaw, ICON_ROTATION_OFFSET);

  const shipIcon = useMemo(() => createShipIcon(), []);
  const portIcon = useMemo(() => createPortDivIcon(), []);
  const processedPorts = useMemo(() => processPorts(ports), [ports]);

  if (!isValidCoordinate(lat) || !isValidCoordinate(lng)) {
    return (
      <div className="no-location">
        <span>No location available</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      scrollWheelZoom
      className="map-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={18}
        minZoom={3}
      />

      <AutoFollow lat={lat} lng={lng} enabled />

      {/* Ship marker */}
      <Marker position={[lat, lng]} icon={shipIcon}>
        <Popup>
          <strong>{name ?? "Ship"}</strong>
          <br />
          Heading: {rotationRaw}°<br />
          COG: {COG ?? "—"}
        </Popup>
      </Marker>

      {/* Port markers */}
      {processedPorts.map((port, i) => (
        <Marker key={i} position={[port.lat, port.lng]} icon={portIcon}>
          <Popup>
            <strong>⚓ {port.name}</strong>
            <br />
            Lat: {port.lat}, Lng: {port.lng}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
});

export default ShipMap;
