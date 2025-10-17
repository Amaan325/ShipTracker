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

  // ✅ State
  const [vesselCodeQuery, setVesselCodeQuery] = useState("");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [mmsi, setMmsi] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedEngineers, setSelectedEngineers] = useState([]);
  const [ports, setPorts] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [label, setLabel] = useState("Other"); // ✅ FIXED
  const [loading, setLoading] = useState(false);

  // Fetch ports & engineers once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [portsRes, engineersRes] = await Promise.all([
          getPorts(),
          getEngineers(),
        ]);
        if (!mounted) return;

        setPorts(portsRes.data);
        setEngineers(engineersRes.data);
      } catch {
        enqueueSnackbar("Failed to load ports or engineers", { variant: "error" });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [enqueueSnackbar]);

  // Handlers
  const onVesselInputChange = useCallback((e) => {
    setVesselCodeQuery(e.target.value);
    setSelectedVessel(null);
    setMmsi("");
  }, []);

  const onVesselSelect = useCallback((v) => {
    setSelectedVessel(v);
    setVesselCodeQuery(v.name);
    setMmsi(v.mmsi);
  }, []);

  const onPortChange = useCallback((port) => {
    setSelectedPort(port);
  }, []);

  const onEngineerChange = useCallback((value) => {
    setSelectedEngineers(value);
  }, []);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmittingRef.current) return;

      if (!selectedVessel && !vesselCodeQuery) {
        enqueueSnackbar("Please enter a vessel name or select an existing one", {
          variant: "warning",
        });
        return;
      }

      if (selectedEngineers.length === 0) {
        enqueueSnackbar("Please assign at least one engineer", {
          variant: "warning",
        });
        return;
      }

      isSubmittingRef.current = true;
      setLoading(true);

      try {
        const res = await addVessel({
          name: selectedVessel?.name ?? vesselCodeQuery,
          mmsi,
          label, // ✅ working now
          port: selectedPort,
          engineers: selectedEngineers,
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
    [selectedVessel, vesselCodeQuery, mmsi, selectedPort, selectedEngineers, label, dispatch, enqueueSnackbar, navigate]
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
    selectedEngineers,
    ports,
    engineers,
    label, // ✅ include it
    setLabel, // ✅ include it
    loading,
    submitText,
    onVesselInputChange,
    onVesselSelect,
    onPortChange,
    onEngineerChange,
    onSubmit,
    setMmsi,
  };
};
