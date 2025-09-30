import React, { useState, useEffect, useCallback, forwardRef, useMemo } from "react";
import InputField from "../common/InputField";
import { searchShips } from "../../services/api";
import debounce from "lodash.debounce";
import { formatShipName } from "../../utils/formatShipName"; // ✅ Import

const VesselAutocomplete = forwardRef(
  (
    {
      label,
      id,
      value,
      onChange,
      onSelect,
      selectedVessel,
      required = false,
      error = "",
      placeholder = "Enter Ship Name",
      className = "",
      ...rest
    },
    ref
  ) => {
    const [suggestions, setSuggestions] = useState([]);

    const fetchVessels = useCallback(
      debounce(async (query) => {
        if (!query || selectedVessel?.name === query) return setSuggestions([]);
        try {
          const { data } = await searchShips(query);
          setSuggestions(data || []);
        } catch (err) {
          console.error("Vessel search error:", err);
        }
      }, 300),
      [selectedVessel]
    );

    useEffect(() => {
      fetchVessels(value);
      return () => fetchVessels.cancel();
    }, [value, fetchVessels]);

    const inputId = useMemo(
      () => id || `vessel-${Math.random().toString(36).slice(2, 9)}`,
      [id]
    );

    return (
      <div className="w-full relative">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <InputField
          id={inputId}
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={className}
          {...rest}
        />

        {suggestions.length > 0 && (
          <ul className="absolute bg-white border border-gray-200 w-full mt-1 max-h-48 overflow-y-auto z-10 shadow-lg rounded-lg">
            {suggestions.map((v) => (
              <li
                key={v.mmsi}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => {
                  onSelect(v);
                  setSuggestions([]);
                }}
              >
                {formatShipName(v.name)} ({v.mmsi})
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

VesselAutocomplete.displayName = "VesselAutocomplete";
export default React.memo(VesselAutocomplete);
