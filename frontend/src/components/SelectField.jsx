import React from "react";

const SelectField = ({ value, onChange, options, placeholder, required }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default SelectField;
