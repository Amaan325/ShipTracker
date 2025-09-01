const ShipDetailsTable = ({ entries }) => {
  console.log("Entries for Table:", entries);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <tbody>
          {entries.map(([label, value]) => (
            <tr key={label} className="odd:bg-gray-50 even:bg-white">
              <th className="border px-4 py-2 text-left font-medium text-gray-700 w-1/3">
                {label}
              </th>
              <td className="border px-4 py-2">
                {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShipDetailsTable;
