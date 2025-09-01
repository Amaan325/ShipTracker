// src/pages/AddVessel.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useDispatch } from "react-redux";

import InputField from "../components/AddVessel/InputField";
import SelectField from "../components/AddVessel/SelectField";
import VesselAutocomplete from "../components/AddVessel/VesselAutoComplete";
import { getPorts, getEngineers, addVessel } from "../services/api";
import { setCurrentVessel } from "../redux/vesselSlice";

const AddVessel = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSubmittingRef = useRef(false);

  // -------------------- State --------------------
  const [vesselCodeQuery, setVesselCodeQuery] = useState("");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [mmsi, setMmsi] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [ports, setPorts] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------------------- Fetch Ports & Engineers --------------------
  useEffect(() => {
    let mounted = true; // prevent state updates if unmounted
    const fetchData = async () => {
      try {
        const [portsRes, engineersRes] = await Promise.all([getPorts(), getEngineers()]);

        if (!mounted) return;

        setPorts(
          portsRes.data.map((p) => ({ value: p._id, label: p.arrival_port_name }))
        );
        setEngineers(
          engineersRes.data.map((e) => ({ value: e._id, label: e.engineer_name }))
        );
      } catch (err) {
        enqueueSnackbar("Failed to load ports or engineers", { variant: "error" });
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [enqueueSnackbar]);

  // -------------------- Handlers --------------------
  const handleVesselInputChange = useCallback((e) => {
    setVesselCodeQuery(e.target.value);
    setSelectedVessel(null);
    setMmsi("");
  }, []);

  const handleVesselSelect = useCallback((v) => {
    setSelectedVessel(v);
    setVesselCodeQuery(v.name);
    setMmsi(v.mmsi);
  }, []);

  const handlePortChange = useCallback((e) => setSelectedPort(e.target.value), []);
  const handleEngineerChange = useCallback((e) => setSelectedEngineer(e.target.value), []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmittingRef.current) return;

      if (!selectedVessel && !vesselCodeQuery) {
        enqueueSnackbar("Please enter a vessel name or select an existing one", { variant: "warning" });
        return;
      }

      isSubmittingRef.current = true;
      setLoading(true);

      const vesselNameToSend = selectedVessel?.name ?? vesselCodeQuery;

      try {
        const res = await addVessel({
          name: vesselNameToSend,
          mmsi,
          port: selectedPort,
          engineer: selectedEngineer,
        });

        dispatch(setCurrentVessel(res.data.vessel));

        const message = res.data.message.includes("already exists")
          ? "Vessel already exists 🚢 Tracking now..."
          : "Vessel added successfully 🚢 Tracking started...";

        enqueueSnackbar(message, {
          variant: res.data.message.includes("already exists") ? "info" : "success",
        });

        navigate("/ship-details");
      } catch (err) {
        console.error(err);
        enqueueSnackbar("Error adding vessel ❌", { variant: "error" });
      } finally {
        isSubmittingRef.current = false;
        setLoading(false);
      }
    },
    [
      selectedVessel,
      vesselCodeQuery,
      mmsi,
      selectedPort,
      selectedEngineer,
      dispatch,
      enqueueSnackbar,
      navigate,
    ]
  );

  // -------------------- Memoized button text --------------------
  const submitText = useMemo(() => (loading ? "Processing..." : "Add Vessel"), [loading]);

  // -------------------- Render --------------------
  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white shadow-lg rounded-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Add Vessel</h2>
      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        <VesselAutocomplete
          value={vesselCodeQuery}
          selectedVessel={selectedVessel}
          onChange={handleVesselInputChange}
          onSelect={handleVesselSelect}
        />

        <SelectField
          value={selectedPort}
          onChange={handlePortChange}
          options={ports}
          placeholder="Select Port"
          required
        />

        <InputField
          type="number"
          placeholder="MMSI"
          value={mmsi}
          onChange={(e) => setMmsi(e.target.value)}
          required
          readOnly={!!selectedVessel}
        />

        <SelectField
          value={selectedEngineer}
          onChange={handleEngineerChange}
          options={engineers}
          placeholder="Select Engineer"
          required
        />

        <button
          type="submit"
          className={`bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {submitText}
        </button>
      </form>
    </div>
  );
};

export default AddVessel;
