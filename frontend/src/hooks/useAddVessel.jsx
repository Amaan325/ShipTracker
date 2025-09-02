// src/pages/AddVessel/hooks/useAddVessel.js
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getPorts, getEngineers, addVessel } from "../services/api";
import { setCurrentVessel } from "../redux/vesselSlice";

export const useAddVessel = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSubmittingRef = useRef(false);

  const [vesselCodeQuery, setVesselCodeQuery] = useState("");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [mmsi, setMmsi] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [ports, setPorts] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch ports & engineers
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [portsRes, engineersRes] = await Promise.all([
          getPorts(),
          getEngineers(),
        ]);
        if (!mounted) return;
        setPorts(
          portsRes.data.map((p) => ({
            value: p._id,
            label: p.arrival_port_name,
          }))
        );
        setEngineers(
          engineersRes.data.map((e) => ({
            value: e._id,
            label: e.engineer_name,
          }))
        );
      } catch {
        enqueueSnackbar("Failed to load ports or engineers", {
          variant: "error",
        });
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [enqueueSnackbar]);

  // Handlers
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

  const handlePortChange = useCallback(
    (e) => setSelectedPort(e.target.value),
    []
  );
  const handleEngineerChange = useCallback(
    (e) => setSelectedEngineer(e.target.value),
    []
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmittingRef.current) return;

      if (!selectedVessel && !vesselCodeQuery) {
        enqueueSnackbar(
          "Please enter a vessel name or select an existing one",
          {
            variant: "warning",
          }
        );
        return;
      }

      isSubmittingRef.current = true;
      setLoading(true);

      try {
        const res = await addVessel({
          name: selectedVessel?.name ?? vesselCodeQuery,
          mmsi,
          port: selectedPort,
          engineer: selectedEngineer,
        });

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
      } catch {
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

  const submitText = useMemo(
    () => (loading ? "Processing..." : "Add Vessel"),
    [loading]
  );

  return {
    vesselCodeQuery,
    selectedVessel,
    mmsi,
    selectedPort,
    selectedEngineer,
    ports,
    engineers,
    loading,
    submitText,
    handleVesselInputChange,
    handleVesselSelect,
    handlePortChange,
    handleEngineerChange,
    handleSubmit,
    setMmsi,
  };
};
