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
  multiple = false,
  getOptionLabel = (opt) => opt.engineer_name || opt.label || opt.value, // 👈 default
  getOptionValue = (opt) => opt._id || opt.value, // 👈 default
}) => {
  const handleChange = (e) => {
    if (multiple) {
      const selected = Array.from(e.target.selectedOptions).map((opt) =>
        options.find((o) => getOptionValue(o) === opt.value)
      );
      onChange?.(selected); // 👈 return full objects
    } else {
      const selected = options.find(
        (o) => getOptionValue(o) === e.target.value
      );
      onChange?.(selected || null);
    }
  };

  const getSelectedValue = () => {
    if (multiple) {
      return value?.map((v) => getOptionValue(v)) ?? [];
    }
    return value ? getOptionValue(value) : "";
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        value={getSelectedValue()}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        multiple={multiple}
        className={`w-full px-3 py-2 border border-gray-300 text-sm text-gray-600 
          bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {!multiple && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={getOptionValue(opt)} value={getOptionValue(opt)}>
            {getOptionLabel(opt)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
