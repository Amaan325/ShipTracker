// src/components/Engineer/AddEngineerForm.jsx
import React, { useState, memo } from "react";
import { GoPlus } from "react-icons/go";
import InputField from "../common/InputField";
import { useSnackbar } from "notistack";

const AddEngineerForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    engineer_name: "",
    email: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () =>
    setForm({ engineer_name: "", email: "", phone_number: "" });

  const handleSubmit = () => {
    if (!form.engineer_name || !form.email || !form.phone_number) {
      enqueueSnackbar("Please fill in all fields ⚠️", { variant: "warning" });
      return;
    }
    onAdd(form, resetForm, setLoading);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-6">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <GoPlus className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-700">Add Engineer</h2>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Engineer Name
          </label>
          <InputField
            name="engineer_name"
            placeholder="Enter engineer name"
            value={form.engineer_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <InputField
            type="email"
            name="email"
            placeholder="engineer@maritime.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <InputField
            name="phone_number"
            placeholder="+92..."
            value={form.phone_number}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Submit */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
        >
          {loading ? "Adding..." : "+ Add Engineer"}
        </button>
      </div>
    </div>
  );
};

export default memo(AddEngineerForm);
