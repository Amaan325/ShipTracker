// src/components/ShipMap/ShipMarker.jsx
import React from "react";
import { Marker, Popup } from "react-leaflet";
import AutoFollow from "./AutoFollow";

const ShipMarker = ({ lat, lng, icon, shipName, heading, COG, destinationPort }) => (
  <>
    <AutoFollow lat={lat} lng={lng} enabled />
    <Marker position={[lat, lng]} icon={icon}>
      <Popup>
        <strong>{shipName ?? "Ship"}</strong>
        <br />
        Heading: {heading}°<br />
        COG: {COG ?? "—"}
        <br />
        {destinationPort && `Destination: ${destinationPort.name}`}
      </Popup>
    </Marker>
  </>
);

export default ShipMarker;
