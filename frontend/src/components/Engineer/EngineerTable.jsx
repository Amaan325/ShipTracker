// src/components/Engineer/EngineerTable.jsx
import React, { memo } from "react";
import { FaUser } from "react-icons/fa";

const EngineerTable = ({ engineers, loading }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      {/* Title */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
        <FaUser className="w-5 h-5 text-blue-500" />
        Engineers ({engineers.length})
      </h2>

      {/* Loader */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading engineers...</p>
      ) : engineers.length === 0 ? (
        <p className="text-gray-500 text-sm">No engineers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="py-3 px-4 font-medium">Engineer Name</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {engineers.map((eng, index) => (
                <tr
                  key={eng.id || index}
                  className="odd:bg-gray-50 even:bg-white hover:bg-blue-50 transition"
                >
                  <td className="py-2 px-4">{eng.engineer_name}</td>
                  <td className="py-2 px-4">{eng.email}</td>
                  <td className="py-2 px-4">{eng.phone_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default memo(EngineerTable);
