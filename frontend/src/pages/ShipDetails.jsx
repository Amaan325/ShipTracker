import React, { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import ShipDetailsTable from "../components/ShipDetails/ShipDetailsTable";
import VesselConflictBanner from "../components/VesselConflictBanner";
import ShipMap from "../components/ShipMap/ShipMap";
import { fieldMap, navStatusMap } from "../components/ShipDetails/fields";
import { useAisData } from "../hooks/useAisData";
import { usePorts } from "../hooks/usePorts";
import { FaMapMarkedAlt, FaShip } from "react-icons/fa";
import Sidebar from "../components/Sidebar";

const HIDDEN_FIELDS = ["HEADING", "COG", "DRAUGHT"];

const ShipDetails = () => {
  const vessel = useSelector((state) => state.vessel.currentVessel);
  const { data: aisData, loading, error, conflict } = useAisData(vessel?.mmsi);
  const { ports } = usePorts();

  const [showConflict, setShowConflict] = useState(true);
  const handleCloseConflict = useCallback(() => setShowConflict(false), []);

  const displayData = useMemo(
    () => (vessel ? { ...vessel, ...aisData } : null),
    [vessel, aisData]
  );

  const destinationPort = useMemo(() => {
    if (!displayData?.port?.arrival_port_name || !ports?.length) return null;
    return ports.find((port) =>
      port.name.toLowerCase().includes(
        displayData.port.arrival_port_name.toLowerCase()
      )
    );
  }, [displayData, ports]);

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

  const hasValidLocation = displayData?.LATITUDE && displayData?.LONGITUDE;

  return (
    <div className="flex  bg-gray-100">

      {/* Main Content */}
      <main className="flex-1 px-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Conflict Banner */}
          {conflict && showConflict && (
            <VesselConflictBanner
              conflict={conflict}
              onClose={handleCloseConflict}
            />
          )}

          <div
            className={`transition ${
              conflict && showConflict ? "filter blur-sm pointer-events-none" : ""
            }`}
          >
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow">
                <FaShip size={22} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Ship Details</h1>
                <p className="text-gray-500 text-sm">
                  Comprehensive vessel tracking and monitoring
                </p>
              </div>
            </div>

            {/* Map Card */}
            <div className="mt-6 bg-white shadow-md rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h3 className="font-semibold flex items-center gap-2 text-gray-700 text-sm">
                  <FaMapMarkedAlt className="text-blue-600" /> Live Ship Tracking
                </h3>
              </div>
              <div className="p-4">
                {loading && <p className="text-gray-500">Loading live AIS data...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {hasValidLocation && (
                  <ShipMap
                    latitude={displayData.LATITUDE}
                    longitude={displayData.LONGITUDE}
                    shipName={displayData.NAME ?? displayData.name}
                    COG={displayData.COG}
                    heading={displayData.HEADING}
                    destinationPort={destinationPort}
                    hasValidLocation={hasValidLocation}
                    zoom={9}
                  />
                )}
              </div>
            </div>

            {/* Details Card */}
            <div className="mt-6 bg-gray-900 text-white rounded-2xl shadow-md">
              <div className="px-5 py-3 border-b border-gray-700 flex text-sm items-center gap-2">
                <FaShip className="text-blue-500 "/> Vessel Details 
              </div>
              <div className="p-4">
                <ShipDetailsTable entries={entries} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShipDetails;
