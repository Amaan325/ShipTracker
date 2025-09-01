import React, { useState } from "react";
import { useSelector } from "react-redux";
import ShipDetailsTable from "../components/ShipDetails/ShipDetailsTable";
import ShipMap from "../components/ShipMap/ShipMap";
import { fieldMap, navStatusMap } from "../components/ShipDetails/fields";
import { useAisData } from "../hooks/useAisData";
import VesselConflictBanner from "../components/VesselConflictBanner";
import { usePorts } from "../hooks/usePorts";


const HIDDEN_FIELDS = ["HEADING", "COG", "DRAUGHT"];


const ShipDetails = () => {
  const vessel = useSelector((state) => state.vessel.currentVessel);
  const { data: aisData, loading, error, conflict } = useAisData(vessel?.mmsi);
  const { ports, loading: portsLoading } = usePorts(); // 👈 get ports

  const [showConflict, setShowConflict] = useState(true);

  if (!vessel)
    return <p className="text-center mt-8 text-gray-500">No vessel selected</p>;

  const displayData = { ...vessel, ...aisData };

  const entries = Object.entries(fieldMap)
    .filter(([key]) => !HIDDEN_FIELDS.includes(key))
    .map(([key, label]) => {
      let value = displayData[key];
      if (key === "port" && value) value = value.arrival_port_name || "-";
      if (key === "engineer" && value) value = value.engineer_name || "-";
      if (key === "NAVSTAT") value = navStatusMap[value] || value;
      if (key === "SOG" && value) value = `${value} kn`;
      if (key === "DRAUGHT" && value) value = `${value} m`;
      return [label, value || "-"];
    });

  return (
    <div className="relative max-w-7xl mx-auto mt-8 p-4">
      {conflict && showConflict && (
        <VesselConflictBanner
          conflict={conflict}
          onClose={() => setShowConflict(false)}
        />
      )}

      <div className={conflict && showConflict ? "filter blur-sm pointer-events-none" : ""}>
        <h2 className="text-2xl font-bold mb-6">Ship Details</h2>

        {loading && <p className="text-gray-500 mb-4">Loading live AIS data...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <ShipMap
          latitude={displayData.LATITUDE}
          longitude={displayData.LONGITUDE}
          name={displayData.NAME || displayData.name}
          COG={displayData.COG}
          heading={displayData.HEADING}
          ports={ports} // 👈 pass ports here
        />

        <ShipDetailsTable entries={entries} />
      </div>
    </div>
  );
};

export default ShipDetails;
