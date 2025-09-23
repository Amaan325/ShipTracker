// src/components/ShipMap/ShipMap.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { createShipIcon, createPortDivIcon } from "./icons";
import { isValidCoordinate, normalizeRotation } from "./utils";
import { getDistanceMeters } from "./DistanceUtils";
import ZoneCircle from "./ZoneCircle";
import ShipMarker from "./ShipMarker";
import PortMarker from "./PortMarker";

const ICON_ROTATION_OFFSET = 0;

const ShipMap = React.memo(function ShipMap({ zoom = 6 }) {
  const vessel = useSelector((state) => state.vessel.currentVessel);

  if (!vessel) {
    return (
      <p className="text-center text-gray-500 mt-4">No vessel selected</p>
    );
  }

  // Handle both uppercase (AIS) and lowercase fields
  const lat =
    vessel.LATITUDE != null
      ? Number(vessel.LATITUDE)
      : vessel.latitude != null
      ? Number(vessel.latitude)
      : null;

  const lng =
    vessel.LONGITUDE != null
      ? Number(vessel.LONGITUDE)
      : vessel.longitude != null
      ? Number(vessel.longitude)
      : null;

  const rotationRaw = vessel.HEADING ?? vessel.heading ?? vessel.COG ?? 0;
  const rotation = normalizeRotation(rotationRaw, ICON_ROTATION_OFFSET);

  const shipIcon = useMemo(() => createShipIcon(rotation), [rotation]);
  const portIcon = useMemo(() => createPortDivIcon(), []);

  // Port info (always lowercase in your backend object)
  const portLat = vessel.port?.latitude ? Number(vessel.port.latitude) : null;
  const portLng = vessel.port?.longitude ? Number(vessel.port.longitude) : null;
  const radiusMeters = vessel.port?.radiusNm
    ? vessel.port.radiusNm * 1852 // NM → meters
    : 25 * 1852; // fallback

  const hasValidLocation =
    lat != null && lng != null && isValidCoordinate(lat) && isValidCoordinate(lng);

  const center = useMemo(() => {
    if (hasValidLocation) return [lat, lng];
    if (portLat && portLng) return [portLat, portLng];
    return [51.0, 4.0]; // fallback
  }, [lat, lng, portLat, portLng, hasValidLocation]);

  const invalidShipLocation =
    hasValidLocation && (!isValidCoordinate(lat) || !isValidCoordinate(lng));

  // Distance check
  let isInsideZone = false;
  if (hasValidLocation && portLat && portLng) {
    const dist = getDistanceMeters(lat, lng, portLat, portLng);
    isInsideZone = dist <= radiusMeters;
  }

  return (
    <>
      {invalidShipLocation && (
        <div className="mb-2 text-red-500">Invalid ship location</div>
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
        {hasValidLocation && (
          <ShipMarker
            lat={lat}
            lng={lng}
            icon={shipIcon}
            shipName={vessel.name ?? vessel.NAME}
            heading={rotationRaw}
            COG={vessel.COG ?? vessel.cog}
            destinationPort={vessel.port}
          />
        )}

        {/* Port + Zone */}
        {portLat && portLng && (
          <>
            <PortMarker
              port={{
                name: vessel.port?.arrival_port_name,
                unlocode: vessel.port?.unlocode,
                lat: portLat,
                lng: portLng,
              }}
              icon={portIcon}
            />
            <ZoneCircle
              center={[portLat, portLng]}
              isInside={isInsideZone}
              radius={radiusMeters}
            />
          </>
        )}
      </MapContainer>
    </>
  );
});

export default ShipMap;
