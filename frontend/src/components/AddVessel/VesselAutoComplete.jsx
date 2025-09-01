// VesselAutocomplete.js
import React, { useState, useEffect, useCallback } from "react";
import InputField from "./InputField";
import { searchShips } from "../../services/api"; // local DB search only
import debounce from "lodash.debounce";

const VesselAutocomplete = ({ value, onChange, onSelect, selectedVessel }) => {
  const [suggestions, setSuggestions] = useState([]);

  // Debounced API call
  const fetchVessels = useCallback(
    debounce(async (query) => {
      if (!query || selectedVessel?.name === query) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await searchShips(query); // local DB search
        setSuggestions(res.data);
      } catch (err) {
        console.error("Vessel search error:", err);
      }
    }, 300), // 300ms debounce
    [selectedVessel]
  );

  useEffect(() => {
    fetchVessels(value);
    return () => fetchVessels.cancel(); // cleanup
  }, [value, fetchVessels]);

  const handleSelect = (vessel) => {
    onSelect(vessel);   // parent updates value & MMSI
    setSuggestions([]); // clear dropdown
  };

  return (
    <div className="relative">
      <InputField
        placeholder="Enter Vessel Code"
        value={value}
        onChange={onChange}
        required
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border w-full mt-1 max-h-48 overflow-y-auto z-10 shadow rounded">
          {suggestions.map((v) => (
            <li
              key={v.mmsi}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(v)}
            >
              {v.name} ({v.mmsi})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VesselAutocomplete;
