// src/pages/ShipDetails.js
import React, { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";

import ShipDetailsTable from "../components/ShipDetails/ShipDetailsTable";
import VesselConflictBanner from "../components/VesselConflictBanner";
import ShipMap from "../components/ShipMap/ShipMap";
import { fieldMap, navStatusMap } from "../components/ShipDetails/fields";
import { useAisData } from "../hooks/useAisData";
import { usePorts } from "../hooks/usePorts";

const HIDDEN_FIELDS = ["HEADING", "COG", "DRAUGHT"];

const ShipDetails = () => {
  const vessel = useSelector((state) => state.vessel.currentVessel);
  const { data: aisData, loading, error, conflict } = useAisData(vessel?.mmsi);
  const { ports, loading: portsLoading } = usePorts();

  const [showConflict, setShowConflict] = useState(true);
  const handleCloseConflict = useCallback(() => setShowConflict(false), []);

  // Merge vessel & AIS data
  const displayData = useMemo(
    () => (vessel ? { ...vessel, ...aisData } : null),
    [vessel, aisData]
  );

  // Find destination port
  const destinationPort = useMemo(() => {
    if (!displayData?.port?.arrival_port_name || !ports || ports.length === 0) 
      return null;
    
    return ports.find(port => 
      port.name.toLowerCase().includes(displayData.port.arrival_port_name.toLowerCase()) ||
      displayData.port.arrival_port_name.toLowerCase().includes(port.name.toLowerCase())
    );
  }, [displayData, ports]);

  // Build details table entries
  const entries = useMemo(() => {
    if (!displayData) return [];

    return Object.entries(fieldMap)
      .filter(([key]) => !HIDDEN_FIELDS.includes(key))
      .map(([key, label]) => {
        let value = displayData[key];

        if (key === "port") value = value?.arrival_port_name ?? "-";
        if (key === "engineer") value = value?.engineer_name ?? "-";
        if (key === "NAVSTAT") value = navStatusMap[value] ?? value;
        if (key === "SOG" && value) value = `${value} kn`;
        if (key === "DRAUGHT" && value) value = `${value} m`;

        return [label, value ?? "-"];
      });
  }, [displayData]);

  if (!vessel) {
    return <p className="text-center mt-8 text-gray-500">No vessel selected</p>;
  }

  const hasValidLocation =
    displayData?.LATITUDE && displayData?.LONGITUDE;

  return (
    <div className="relative max-w-7xl mx-auto mt-8 p-4">
      {/* Conflict Banner */}
      {conflict && showConflict && (
        <VesselConflictBanner conflict={conflict} onClose={handleCloseConflict} />
      )}

      <div className={conflict && showConflict ? "filter blur-sm pointer-events-none" : ""}>
        <h2 className="text-2xl font-bold mb-6">Ship Details</h2>

        {/* Loading/Error Messages */}
        {loading && <p className="text-gray-500 mb-4">Loading live AIS data...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Single Map Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Ship Location & Destination</h3>
          <ShipMap
            latitude={displayData.LATITUDE}
            longitude={displayData.LONGITUDE}
            shipName={displayData.NAME ?? displayData.name}
            COG={displayData.COG}
            heading={displayData.HEADING}
            destinationPort={destinationPort}
            hasValidLocation={hasValidLocation}
            zoom={hasValidLocation ? 9 : 4}
          />
        </div>

        {/* Details Table */}
        <ShipDetailsTable entries={entries} />
      </div>
    </div>
  );
};

export default ShipDetails;