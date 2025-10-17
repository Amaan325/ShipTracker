import React, { useState, useEffect, useCallback } from "react";
import { FaUser } from "react-icons/fa";
import {
  getEngineers,
  addEngineer,
  updateEngineer,
  deleteEngineer,
} from "../services/api";
import { useSnackbar } from "notistack";
import AddEngineerForm from "../components/Engineer/AddEngineerForm";
import EngineerTable from "../components/Engineer/EngineerTable";

const EngineerForm = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // ✅ Fetch engineers
  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        setLoading(true);
        const res = await getEngineers();
        setEngineers(res.data || []);
      } catch (err) {
        enqueueSnackbar("Failed to fetch engineers ❌", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchEngineers();
  }, [enqueueSnackbar]);

  // ✅ Add or Update engineer
  const handleAdd = useCallback(
    async (form, resetForm, setFormLoading) => {
      try {
        setFormLoading(true);
        if (editing) {
          const res = await updateEngineer(editing._id, form);
          setEngineers((prev) =>
            prev.map((e) => (e._id === editing._id ? res.data : e))
          );
          enqueueSnackbar("Engineer updated successfully ✅", {
            variant: "success",
          });
          setEditing(null);
        } else {
          const res = await addEngineer(form);
          setEngineers((prev) => [...prev, res.data]);
          enqueueSnackbar("Engineer added successfully ✅", {
            variant: "success",
          });
        }
        resetForm();
      } catch (err) {
        enqueueSnackbar("Failed to save engineer ❌", { variant: "error" });
      } finally {
        setFormLoading(false);
      }
    },
    [enqueueSnackbar, editing]
  );

  // ✅ Delete engineer (no confirm)
  const handleDelete = async (id) => {
    try {
      await deleteEngineer(id);
      setEngineers((prev) => prev.filter((e) => e._id !== id));
      enqueueSnackbar("Engineer deleted ✅", { variant: "info" });
    } catch (err) {
      enqueueSnackbar("Failed to delete engineer ❌", { variant: "error" });
    }
  };

  // ✅ Set engineer to edit
  const handleEdit = (engineer) => {
    setEditing(engineer);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 pt-20 md:pt-0">
        {/* Header */}
        <header className="flex items-center gap-3 mb-8 md:px-0">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow">
            <FaUser size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Engineer Management
            </h1>
            <p className="text-gray-500 text-sm">
              Add, edit, or remove marine engineers
            </p>
          </div>
        </header>

        {/* Add/Edit Form */}
        <div className="md:px-0">
          <AddEngineerForm
            onAdd={handleAdd}
            editing={editing}
            setEditing={setEditing}
          />
        </div>

        {/* Engineer List */}
        <div className="mt-6 px-0 md:px-0">
          <EngineerTable
            engineers={engineers}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
};

export default EngineerForm;
