import React, { forwardRef, useMemo } from "react";

const InputField = forwardRef(
  (
    {
      label,
      id,
      type = "text",
      placeholder = "",
      value,
      defaultValue,
      onChange,
      required = false,
      readOnly = false,
      disabled = false,
      error = "",
      className = "",
      ...rest
    },
    ref
  ) => {
    const isControlled = value !== undefined;

    // Generate fallback id for accessibility if not provided
    const inputId = useMemo(() => id || `input-${Math.random().toString(36).slice(2, 9)}`, [id]);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          placeholder={placeholder}
          {...(isControlled ? { value, onChange } : { defaultValue, onChange })}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 
            focus:outline-none focus:ring-2 focus:ring-blue-400 w-full
            disabled:opacity-50 disabled:cursor-not-allowed 
            ${error ? "border-red-500 focus:ring-red-400" : ""}
            ${className}`}
          {...rest}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-xs text-red-600"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default React.memo(InputField);
