// src/components/ShipMap/ShipMap.jsx
import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import AutoFollow from "../ShipMap/AutoFollow";
import { createShipIcon, createPortDivIcon } from "../ShipMap/icons";
import { isValidCoordinate, normalizeRotation } from "../ShipMap/utils";

const ICON_ROTATION_OFFSET = 0;

const ShipMap = React.memo(function ShipMap({
  latitude,
  longitude,
  shipName,
  COG,
  heading,
  ports = [],
  zoom = 10, // default zoom passed in
  showShip = true,
  showPorts = true,
}) {
  const lat = latitude == null ? null : Number(latitude);
  const lng = longitude == null ? null : Number(longitude);
  const rotationRaw = heading ?? COG ?? 0;
  const rotation = normalizeRotation(rotationRaw, ICON_ROTATION_OFFSET);

  // ✅ Always call hooks at the top
  const shipIcon = useMemo(() => createShipIcon(), []);
  const portIcon = useMemo(() => createPortDivIcon(), []);

  // Adjust zoom: if showing a ship, zoom out a bit
  const mapZoom = useMemo(() => {
    if (showShip && isValidCoordinate(lat) && isValidCoordinate(lng)) {
      return 6; // 👈 Less zoomed in for ship
    }
    return zoom; // fallback to default zoom
  }, [showShip, lat, lng, zoom]);

  // Center map
  const center = useMemo(() => {
    if (showShip && isValidCoordinate(lat) && isValidCoordinate(lng))
      return [lat, lng];
    if (showPorts && ports.length > 0) return [ports[0].lat, ports[0].lng];
    return [51.0, 4.0]; // fallback
  }, [lat, lng, ports, showShip, showPorts]);

  const invalidShipLocation =
    showShip && (!isValidCoordinate(lat) || !isValidCoordinate(lng));

  return (
    <>
      {invalidShipLocation && (
        <div className="no-location mb-2">
          <span>No ship location available</span>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={mapZoom}
        scrollWheelZoom
        className="map-container h-[400px] w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={3}
        />

        {showShip && !invalidShipLocation && (
          <>
            <AutoFollow lat={lat} lng={lng} enabled />
            <Marker position={[lat, lng]} icon={shipIcon}>
              <Popup>
                <strong>{shipName ?? "Ship"}</strong>
                <br />
                Heading: {rotationRaw}°<br />
                COG: {COG ?? "—"}
              </Popup>
            </Marker>
          </>
        )}

        {showPorts &&
          ports.map((port, i) => (
            <Marker key={i} position={[port.lat, port.lng]} icon={portIcon}>
              <Popup>
                <strong>⚓ {port.name}</strong>
                <br />
                Lat: {port.lat}, Lng: {port.lng}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </>
  );
});

export default ShipMap;
