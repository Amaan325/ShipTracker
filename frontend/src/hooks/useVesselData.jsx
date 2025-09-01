// hooks/useVesselData.js
import { useState, useEffect } from "react";
import { getPorts, getEngineers } from "../services/api";
import { useSnackbar } from "notistack";

export const useVesselData = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [ports, setPorts] = useState([]);
  const [engineers, setEngineers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const portsRes = await getPorts();
        const engineersRes = await getEngineers();

        setPorts(
          portsRes.data.map((port) => ({ value: port._id, label: port.arrival_port_name }))
        );
        setEngineers(
          engineersRes.data.map((eng) => ({ value: eng._id, label: eng.engineer_name }))
        );
      } catch (err) {
        enqueueSnackbar("Failed to load data", { variant: "error" });
      }
    };
    fetchData();
  }, [enqueueSnackbar]);

  return { ports, engineers };
};
