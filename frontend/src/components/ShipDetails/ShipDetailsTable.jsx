import { formatShipName } from "../../utils/formatShipName"; // adjust path

const ShipDetailsTable = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return <p className="text-gray-400 text-center py-4">No data available</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-max border border-gray-700 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-800">
            {entries.map(([label]) => (
              <th
                key={label}
                className="px-4 py-3 text-left font-medium text-[13px] text-gray-200 border-b border-gray-700 whitespace-nowrap"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-gray-900">
            {entries.map(([label, value], index) => (
              <td
                key={label}
                className="px-4 py-3 border-b border-gray-700 text-gray-100 text-[13px] whitespace-nowrap"
              >
                {label.toLowerCase() === "ship name"
                  ? formatShipName(value)
                  : typeof value === "boolean"
                  ? value
                    ? "Yes"
                    : "No"
                  : value}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ShipDetailsTable;
