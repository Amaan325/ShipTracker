// src/components/ShipMap/ZoneCircle.jsx
import React from "react";
import { Circle } from "react-leaflet";

const ZoneCircle = ({ center, isInside, radius }) => {
  return (
    <Circle
      center={center}
      radius={radius}
      pathOptions={{
        color: isInside ? "green" : "red",
        fillColor: isInside ? "green" : "red",
        fillOpacity: 0.15,
      }}
    />
  );
};

export default ZoneCircle;
