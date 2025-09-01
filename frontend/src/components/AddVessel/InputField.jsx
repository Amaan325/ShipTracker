const InputField = ({
  type = "text",
  placeholder,
  value,
  readOnly,
  onChange,
  required,
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      readOnly={readOnly} // ✅ add this
      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
    />
  );
};

export default InputField;
