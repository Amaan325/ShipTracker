// src/components/ShipMap/AutoFollow.jsx
import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { haversineDistanceMeters } from "./utils";

const RECENTER_THRESHOLD_METERS = 50;

const AutoFollow = ({ lat, lng, enabled = true }) => {
  const map = useMap();
  const prevRef = useRef({ lat: null, lng: null });

  useEffect(() => {
    if (!enabled || lat == null || lng == null) return;
    const { lat: prevLat, lng: prevLng } = prevRef.current;

    if (prevLat == null || prevLng == null) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
      prevRef.current = { lat, lng };
      return;
    }

    const dist = haversineDistanceMeters(prevLat, prevLng, lat, lng);
    if (dist >= RECENTER_THRESHOLD_METERS) {
      map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 0.8 });
      prevRef.current = { lat, lng };
    }
  }, [lat, lng, map, enabled]);

  return null;
};

export default AutoFollow;