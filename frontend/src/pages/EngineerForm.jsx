// src/pages/EngineerForm.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaUser } from "react-icons/fa";
import { getEngineers, addEngineer } from "../services/api";
import { useSnackbar } from "notistack";
import AddEngineerForm from "../components/Engineer/AddEngineerForm";
import EngineerTable from "../components/Engineer/EngineerTable";

const EngineerForm = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // ✅ Fetch engineers
  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        setLoading(true);
        const res = await getEngineers();
        setEngineers(res.data || []);
      } catch (err) {
        console.error("Error fetching engineers:", err);
        enqueueSnackbar("Failed to fetch engineers ❌", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchEngineers();
  }, [enqueueSnackbar]);

  // ✅ Add new engineer (memoized)
  const handleAdd = useCallback(
    async (form, resetForm, setFormLoading) => {
      try {
        setFormLoading(true);
        const res = await addEngineer(form);
        setEngineers((prev) => [...prev, res.data]);
        resetForm();
        enqueueSnackbar("Engineer added successfully ✅", {
          variant: "success",
        });
      } catch (err) {
        console.error(
          "Error adding engineer:",
          err.response?.data || err.message
        );
        enqueueSnackbar("Failed to add engineer ❌", { variant: "error" });
      } finally {
        setFormLoading(false);
      }
    },
    [enqueueSnackbar]
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ✅ add top margin only on mobile */}
      <main className="flex-1 pt-20 md:pt-0">
        {/* Header */}
        <header className="flex items-center gap-3 mb-8  md:px-0">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow">
            <FaUser size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Engineer Management
            </h1>
            <p className="text-gray-500 text-sm">
              Add and manage marine engineers
            </p>
          </div>
        </header>

        {/* Add Engineer Form */}
        <div className=" md:px-0">
          <AddEngineerForm onAdd={handleAdd} />
        </div>

        {/* Engineer List - mobile gutter fix */}
        <div className="mt-6 px-0 md:px-0">
          {/* 
            strategy:
            - overflow-x-auto on small screens so the table can scroll horizontally
            - inner padded block (px-4) on mobile to preserve left/right gutters
            - md:px-0 to keep desktop unchanged
          */}
          <div className="overflow-x-auto md:overflow-visible">
            {/* <div className="inline-block min-w-full px-4 md:px-0 box-border"> */}
            <EngineerTable engineers={engineers} loading={loading} />
            {/* </div> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EngineerForm;
