// src/pages/Monitoring.jsx
import React, { useEffect, useState } from "react";
import { getAllVessels } from "../services/api";
import { LiaShipSolid } from "react-icons/lia";
import ShipMapAll from "../components/Monitoring/ShipMapAll";

const Monitoring = () => {
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVessels = async () => {
    try {
      const { data } = await getAllVessels();
      if (data && data.success && Array.isArray(data.vessels)) {
        setVessels(data.vessels);
      } else {
        setVessels([]);
      }
    } catch (err) {
      console.error("Error fetching vessels:", err);
      setVessels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const headers = [
    "#",
    "Ship Name",
    "MMSI Number",
    "Callsign",
    "Speed (knots)",
    "Latitude",
    "Longitude",
    "Destination",
    "ETA",
    "Last Updated",
    "Selected Port",
    "Engineer",
  ];

  return (
    <div className="min-h-screen bg-gray-100 ">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow">
          <LiaShipSolid size={26} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Vessel Monitoring
          </h1>
          <p className="text-gray-500 text-sm">
            Real-time tracking of registered vessels
          </p>
        </div>
      </header>

      {/* Map Section */}
      <div className="mb-6">
        <ShipMapAll vessels={vessels} />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-400 text-center py-4">Loading...</p>
      ) : vessels.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No vessels found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-max border border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800">
                {headers.map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left font-medium text-[13px] text-gray-200 border-b border-gray-700 whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vessels.map((vessel, index) => (
                <tr
                  key={vessel._id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-900" : "bg-gray-700"
                  } hover:bg-gray-600 transition`}
                >
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {vessel.name || "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {vessel.mmsi || "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {vessel.callsign || "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {vessel.sog || "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {vessel.latitude || "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {vessel.longitude || "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {vessel.destination || "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {vessel.eta || "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {vessel.lastUpdated
                      ? new Date(vessel.lastUpdated).toLocaleString("en-GB", {
                          timeZone: "UTC",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }) + " GMT"
                      : "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {vessel.port?.unlocode || "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                    {vessel.engineer?.engineer_name || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Monitoring;
