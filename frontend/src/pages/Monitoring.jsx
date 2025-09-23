import React, { useEffect, useState } from "react";
import { getAllVessels, getAllVesselsForMap } from "../services/api";
import { LiaShipSolid } from "react-icons/lia";
import ShipMapAll from "../components/Monitoring/ShipMapAll";

const Monitoring = () => {
  const [vessels, setVessels] = useState([]);
  const [mapVessels, setMapVessels] = useState([]); // all vessels for map
  const [loading, setLoading] = useState(true);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // fetch paginated vessels for table
  const fetchVessels = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await getAllVessels(page, 10);
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

  // fetch all vessels for map (once + refresh interval)
  const fetchMapVessels = async () => {
    try {
      const { data } = await getAllVesselsForMap();
      if (data?.success) {
        setMapVessels(data.vessels);
      }
    } catch (err) {
      console.error("Error fetching map vessels:", err);
    }
  };

  useEffect(() => {
    fetchVessels(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchMapVessels();
    const interval = setInterval(fetchMapVessels, 600000); // refresh map every 10 minutes
    return () => clearInterval(interval);
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
    <div className="min-h-screen bg-gray-100 pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto">
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

        {/* Map */}
        <div className="mb-6">
          <ShipMapAll vessels={mapVessels} />
        </div>

        {/* Table */}
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
                  {vessels.map((vessel, index) => (
                    <tr
                      key={vessel._id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-900" : "bg-gray-700"
                      } hover:bg-gray-600 transition`}
                    >
                      <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                        {(currentPage - 1) * 10 + index + 1}
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
                        {vessel.sog ?? "-"}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                        {vessel.latitude ?? "-"}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                        {vessel.longitude ?? "-"}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                        {vessel.destination || "-"}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                        {vessel.eta || "-"}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap">
                        {vessel.lastUpdated
                          ? new Date(vessel.lastUpdated).toLocaleString(
                              "en-GB",
                              { timeZone: "UTC" }
                            ) + " GMT"
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

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-800 text-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-blue-800 text-gray-200 rounded disabled:opacity-50"
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
