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
        <>
          {/* Table for md+ screens */}
          <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full text-sm border-collapse table-fixed min-w-[500px]">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                  <th className="py-3 px-4 font-medium w-1/4">Engineer Name</th>
                  <th className="py-3 px-4 font-medium w-1/2">Email</th>
                  <th className="py-3 px-4 font-medium w-1/4">Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {engineers.map((eng, index) => (
                  <tr
                    key={eng.id || index}
                    className="odd:bg-gray-50 even:bg-white hover:bg-blue-50 transition"
                  >
                    <td className="py-2 px-4 break-words truncate max-w-[120px] sm:max-w-full">
                      {eng.engineer_name}
                    </td>
                    <td className="py-2 px-4 break-words truncate max-w-[180px] sm:max-w-full">
                      {eng.email}
                    </td>
                    <td className="py-2 px-4 break-words truncate max-w-[120px] sm:max-w-full">
                      {eng.phone_number}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card layout for small screens */}
          <div className="md:hidden flex flex-col gap-3">
            {engineers.map((eng, index) => (
              <div
                key={eng.id || index}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <p className="text-sm font-medium text-gray-700">
                  Name: <span className="font-normal">{eng.engineer_name}</span>
                </p>
                <p className="text-sm font-medium text-gray-700">
                  Email: <span className="font-normal">{eng.email}</span>
                </p>
                <p className="text-sm font-medium text-gray-700">
                  Phone: <span className="font-normal">{eng.phone_number}</span>
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(EngineerTable);
