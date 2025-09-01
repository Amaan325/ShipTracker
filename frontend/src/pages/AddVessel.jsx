// src/pages/AddVessel.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useDispatch } from "react-redux";

import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import VesselAutocomplete from "../components/VesselAutoComplete";
import { getPorts, getEngineers, addVessel } from "../services/api";
import { setCurrentVessel } from "../redux/vesselSlice";

const AddVessel = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSubmittingRef = useRef(false);

  // Form state
  const [vesselCodeQuery, setVesselCodeQuery] = useState("");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [mmsi, setMmsi] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [ports, setPorts] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [showLoading, setShowLoading] = useState(false);

  // Fetch ports & engineers on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portsRes, engineersRes] = await Promise.all([
          getPorts(),
          getEngineers(),
        ]);

        setPorts(
          portsRes.data.map((port) => ({
            value: port._id,
            label: port.arrival_port_name,
          }))
        );

        setEngineers(
          engineersRes.data.map((eng) => ({
            value: eng._id,
            label: eng.engineer_name,
          }))
        );
      } catch (err) {
        enqueueSnackbar("Failed to load ports or engineers", {
          variant: "error",
        });
      }
    };
    fetchData();
  }, [enqueueSnackbar]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setShowLoading(true);

    if (!selectedVessel && !vesselCodeQuery) {
      enqueueSnackbar("Please enter a vessel name or select an existing one", {
        variant: "warning",
      });
      isSubmittingRef.current = false;
      setShowLoading(false);
      return;
    }

    const vesselNameToSend = selectedVessel
      ? selectedVessel.name
      : vesselCodeQuery;

    try {
      const res = await addVessel({
        name: vesselNameToSend,
        mmsi,
        port: selectedPort,
        engineer: selectedEngineer,
      });

      // Save the whole vessel object in Redux
      dispatch(setCurrentVessel(res.data.vessel));

      enqueueSnackbar(
        res.data.message.includes("already exists")
          ? "Vessel already exists 🚢 Tracking now..."
          : "Vessel added successfully 🚢 Tracking started...",
        {
          variant: res.data.message.includes("already exists")
            ? "info"
            : "success",
        }
      );

      navigate("/ship-details");
    } catch (err) {
      enqueueSnackbar("Error adding vessel ❌", { variant: "error" });
      console.error(err);
    } finally {
      isSubmittingRef.current = false;
      setShowLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white shadow-lg rounded-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Add Vessel
      </h2>

      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        {/* Vessel autocomplete */}
        <VesselAutocomplete
          value={vesselCodeQuery}
          selectedVessel={selectedVessel}
          onChange={(e) => {
            setVesselCodeQuery(e.target.value);
            setSelectedVessel(null);
            setMmsi("");
          }}
          onSelect={(v) => {
            setSelectedVessel(v);
            setVesselCodeQuery(v.name);
            setMmsi(v.mmsi);
          }}
        />

        {/* Port selection */}
        <SelectField
          value={selectedPort}
          onChange={(e) => setSelectedPort(e.target.value)}
          options={ports}
          placeholder="Select Port"
          required
        />

        {/* MMSI */}
        <InputField
          type="number"
          placeholder="MMSI"
          value={mmsi}
          onChange={(e) => setMmsi(e.target.value)}
          required
          readOnly={!!selectedVessel}
        />

        {/* Engineer */}
        <SelectField
          value={selectedEngineer}
          onChange={(e) => setSelectedEngineer(e.target.value)}
          options={engineers}
          placeholder="Select Engineer"
          required
        />

        <button
          type="submit"
          className={`bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow ${
            showLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={showLoading}
        >
          {showLoading ? "Processing..." : "Add Vessel"}
        </button>
      </form>
    </div>
  );
};

export default AddVessel;
