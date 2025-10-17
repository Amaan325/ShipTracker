import React, { useState, useEffect, memo } from "react";
import { GoPlus } from "react-icons/go";
import InputField from "../common/InputField";
import { useSnackbar } from "notistack";

const AddEngineerForm = ({ onAdd, editing, setEditing }) => {
  const [form, setForm] = useState({
    engineer_name: "",
    email: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // 🧠 Prefill form when editing changes
  useEffect(() => {
    if (editing) {
      setForm({
        engineer_name: editing.engineer_name || "",
        email: editing.email || "",
        phone_number: editing.phone_number || "",
      });
    }
  }, [editing]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setForm({ engineer_name: "", email: "", phone_number: "" });
    setEditing(null); // reset editing mode
  };

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
        <h2 className="text-lg font-semibold text-gray-700">
          {editing ? "Edit Engineer" : "Add Engineer"}
        </h2>
      </div>

      {/* Form Fields */}
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

      {/* Buttons */}
      <div className="mt-4 flex justify-end gap-3">
        {editing && (
          <button
            onClick={resetForm}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`${
            editing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
          } disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition`}
        >
          {loading
            ? editing
              ? "Updating..."
              : "Adding..."
            : editing
            ? "Update Engineer"
            : "+ Add Engineer"}
        </button>
      </div>
    </div>
  );
};

export default memo(AddEngineerForm);
