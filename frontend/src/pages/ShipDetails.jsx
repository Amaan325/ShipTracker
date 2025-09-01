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

  const displayData = useMemo(() => ({ ...vessel, ...aisData }), [vessel, aisData]);

  const entries = useMemo(() => {
    if (!displayData) return [];

    return Object.entries(fieldMap)
      .filter(([key]) => !HIDDEN_FIELDS.includes(key))
      .map(([key, label]) => {
        let value = displayData[key];
        if (key === "port" && value) value = value.arrival_port_name ?? "-";
        if (key === "engineer" && value) value = value.engineer_name ?? "-";
        if (key === "NAVSTAT") value = navStatusMap[value] ?? value;
        if (key === "SOG" && value) value = `${value} kn`;
        if (key === "DRAUGHT" && value) value = `${value} m`;
        return [label, value ?? "-"];
      });
  }, [displayData]);

  if (!vessel) return <p className="text-center mt-8 text-gray-500">No vessel selected</p>;

  return (
    <div className="relative max-w-7xl mx-auto mt-8 p-4">
      {conflict && showConflict && (
        <VesselConflictBanner conflict={conflict} onClose={handleCloseConflict} />
      )}

      <div className={conflict && showConflict ? "filter blur-sm pointer-events-none" : ""}>
        <h2 className="text-2xl font-bold mb-6">Ship Details</h2>

        {loading && <p className="text-gray-500 mb-4">Loading live AIS data...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Ship Map */}
          <div>
            <h3 className="text-lg font-bold mb-2">Ship Location</h3>
            <ShipMap
              latitude={displayData.LATITUDE}
              longitude={displayData.LONGITUDE}
              shipName={displayData.NAME ?? displayData.name}
              COG={displayData.COG}
              heading={displayData.HEADING}
              showShip={true}
              showPorts={false}
              zoom={10}
            />
          </div>

          {/* Ports Map */}
          <div>
            <h3 className="text-lg font-bold mb-2">Ports</h3>
            <ShipMap
              ports={ports}
              showShip={false}
              showPorts={true}
              zoom={6}
            />
          </div>
        </div>

        <ShipDetailsTable entries={entries} />
      </div>
    </div>
  );
};

export default ShipDetails;
