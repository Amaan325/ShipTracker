// src/components/ShipMap/ShipMap.jsx
import React, { useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { createShipIcon, createPortDivIcon } from "./icons";
import { isValidCoordinate, normalizeRotation } from "./utils";
import { getDistanceMeters } from "./DistanceUtils";
import ZoneCircle from "./ZoneCircle";
import ShipMarker from "./ShipMarker";
import PortMarker from "./PortMarker";

const ICON_ROTATION_OFFSET = 0;
const RADIUS_METERS = 25 * 1852; // 25nm in meters

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

  const shipIcon = useMemo(() => createShipIcon(rotation), [rotation]);
  const portIcon = useMemo(() => createPortDivIcon(), []);

  const center = useMemo(() => {
    if (hasValidLocation && isValidCoordinate(lat) && isValidCoordinate(lng))
      return [lat, lng];
    if (destinationPort) return [destinationPort.lat, destinationPort.lng];
    return [51.0, 4.0]; // fallback
  }, [lat, lng, destinationPort, hasValidLocation]);

  const invalidShipLocation =
    hasValidLocation && (!isValidCoordinate(lat) || !isValidCoordinate(lng));

  // Distance check for circle highlight
  let isInsideZone = false;
  if (
    hasValidLocation &&
    destinationPort &&
    isValidCoordinate(lat) &&
    isValidCoordinate(lng)
  ) {
    const dist = getDistanceMeters(lat, lng, destinationPort.lat, destinationPort.lng);
    isInsideZone = dist <= RADIUS_METERS;
  }

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
        className="map-container h-[500px] w-full rounded-2xl overflow-hidden"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={3}
        />

        {/* Ship Marker */}
        {hasValidLocation && !invalidShipLocation && (
          <ShipMarker
            lat={lat}
            lng={lng}
            icon={shipIcon}
            shipName={shipName}
            heading={rotationRaw}
            COG={COG}
            destinationPort={destinationPort}
          />
        )}

        {/* Destination Port Marker + Zone */}
        {destinationPort && (
          <>
            <PortMarker port={destinationPort} icon={portIcon} />
            <ZoneCircle
              center={[destinationPort.lat, destinationPort.lng]}
              isInside={isInsideZone}
              radius={RADIUS_METERS}
            />
          </>
        )}
      </MapContainer>
    </>
  );
});

export default ShipMap;
