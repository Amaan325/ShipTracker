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
  destinationPort = null,
  hasValidLocation = false,
  zoom = 6,
}) {
  const lat = latitude == null ? null : Number(latitude);
  const lng = longitude == null ? null : Number(longitude);
  const rotationRaw = heading ?? COG ?? 0;
  const rotation = normalizeRotation(rotationRaw, ICON_ROTATION_OFFSET);

  // ✅ Always call hooks at the top
  const shipIcon = useMemo(() => createShipIcon(rotation), [rotation]);
  const portIcon = useMemo(() => createPortDivIcon(), []);

  // Center map
  const center = useMemo(() => {
    if (hasValidLocation && isValidCoordinate(lat) && isValidCoordinate(lng))
      return [lat, lng];
    if (destinationPort) return [destinationPort.lat, destinationPort.lng];
    return [51.0, 4.0]; // fallback
  }, [lat, lng, destinationPort, hasValidLocation]);

  const invalidShipLocation = hasValidLocation && (!isValidCoordinate(lat) || !isValidCoordinate(lng));

  return (
    <>
      {invalidShipLocation && (
        <div className="no-location mb-2">
          <span>No ship location available</span>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="map-container h-[500px] w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={3}
        />

        {/* Ship Marker */}
        {hasValidLocation && !invalidShipLocation && (
          <>
            <AutoFollow lat={lat} lng={lng} enabled />
            <Marker position={[lat, lng]} icon={shipIcon}>
              <Popup>
                <strong>{shipName ?? "Ship"}</strong>
                <br />
                Heading: {rotationRaw}°<br />
                COG: {COG ?? "—"}<br />
                {destinationPort && `Destination: ${destinationPort.name}`}
              </Popup>
            </Marker>
          </>
        )}

        {/* Destination Port Marker */}
        {destinationPort && (
          <Marker position={[destinationPort.lat, destinationPort.lng]} icon={portIcon}>
            <Popup>
              <strong>⚓ Destination: {destinationPort.name}</strong>
              <br />
              Lat: {destinationPort.lat}, Lng: {destinationPort.lng}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </>
  );
});

export default ShipMap;