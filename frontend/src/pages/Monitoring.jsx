import React, { useEffect, useState } from "react";
import {
  getAllVessels,
  getAllVesselsForMap,
  getAllCompletedVessels,
} from "../services/api";
import { LiaShipSolid } from "react-icons/lia";
import ShipMapAll from "../components/Monitoring/ShipMapAll";
import { formatShipName, toTitleCase } from "../utils/formatShipName"; // ✅ Import

const Monitoring = () => {
  const [vessels, setVessels] = useState([]);
  const [mapVessels, setMapVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("tracking");

  const fetchVessels = async (page = 1, activeFilter = filter) => {
    try {
      setLoading(true);
      let data;
      if (activeFilter === "tracking") {
        const res = await getAllVessels(page, 10);
        data = res.data;
      } else {
        const res = await getAllCompletedVessels(page, 10);
        data = res.data;
      }
      if (data?.success) {
        setVessels(data.vessels);
        setTotalPages(data.totalPages);
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

  const fetchMapVessels = async () => {
    try {
      const { data } = await getAllVesselsForMap();
      if (data?.success) setMapVessels(data.vessels);
    } catch (err) {
      console.error("Error fetching map vessels:", err);
    }
  };

  useEffect(() => {
    fetchVessels(currentPage, filter);
  }, [currentPage, filter]);

  useEffect(() => {
    fetchMapVessels();
    const interval = setInterval(fetchMapVessels, 600000);
    return () => clearInterval(interval);
  }, []);

  const headers = [
    "#",
    "Ship Name",
    "MMSI Number",
    "Speed (knots)",
    "Destination",
    "ETA",
    "Tracking Start",
    "Last Updated",
    "Selected Port",
    "Engineer",
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow">
            <LiaShipSolid size={26} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Vessel Monitoring</h1>
            <p className="text-gray-500 text-sm">Real-time tracking of registered vessels</p>
          </div>
        </header>

        <div className="mb-6">
          <ShipMapAll vessels={mapVessels} />
        </div>

        <div className="flex justify-center gap-4 mb-6">
          {["tracking", "completed"].map((option) => (
            <button
              key={option}
              onClick={() => {
                setFilter(option);
                setCurrentPage(1);
              }}
              className={`px-6 py-2 rounded-full font-medium text-sm shadow-sm transition-all duration-300 ${
                filter === option
                  ? "bg-blue-700 text-white shadow-md scale-105"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:shadow"
              }`}
            >
              {option === "tracking" ? "Tracking" : "Completed"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-4">Loading...</p>
        ) : vessels.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No vessels found</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
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
                  {vessels.map((vessel, vIndex) => {
                    const engineerNames =
                      Array.isArray(vessel.engineers) && vessel.engineers.length > 0
                        ? vessel.engineers.map((e) => e.engineer_name).join(", ")
                        : "-";

                    return (
                      <tr
                        key={vessel._id}
                        className={`${vIndex % 2 === 0 ? "bg-gray-900" : "bg-gray-700"} hover:bg-gray-600 transition`}
                      >
                        <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                          {(currentPage - 1) * 10 + vIndex + 1}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                          {formatShipName(vessel.name)}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                          {vessel.mmsi || "-"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                          {vessel.sog ?? "-"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                          {vessel.destination || "-"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                          {vessel.eta || "-"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                          {vessel.trackingStartedAt
                            ? new Date(vessel.trackingStartedAt).toLocaleString("en-GB", { timeZone: "UTC" }) + " GMT"
                            : "-"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                          {vessel.lastUpdated
                            ? new Date(vessel.lastUpdated).toLocaleString("en-GB", { timeZone: "UTC" }) + " GMT"
                            : "-"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                          {vessel.port?.unlocode || "-"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                          {engineerNames !== "-" ? (
                            <div className="flex flex-wrap gap-1">
                              {engineerNames.split(", ").map((name, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-600/80 text-white px-2 py-0.5 rounded-full text-xs shadow-sm"
                                >
                                  {toTitleCase(name)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-700 text-gray-200 rounded-2xl disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-blue-700 text-gray-200 rounded-2xl disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Monitoring;
