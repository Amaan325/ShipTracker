import React from "react";

const SelectField = ({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  label,
  className = "",
  disabled = false,
}) => {
  // fallback for uncontrolled usage (avoids React warnings)
  const handleChange = onChange || (() => {});

  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        value={value ?? ""}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 text-sm text-gray-600 
          bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
