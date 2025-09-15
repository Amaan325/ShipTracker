// src/components/ShipMap/PortMarker.jsx
import React from "react";
import { Marker, Popup } from "react-leaflet";

const PortMarker = ({ port, icon, unlocode }) => (
  <Marker position={[port.lat, port.lng]} icon={icon}>
    <Popup>
      <strong>⚓ Destination: {port.name} </strong> <br />
      <strong> Unlocode : {port.unlocode}</strong>
      <br />
      Lat: {port.lat}, Lng: {port.lng}
    </Popup>
  </Marker>
);

export default PortMarker;
