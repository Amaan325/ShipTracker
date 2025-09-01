import { useEffect, useState } from "react";
import { getPorts } from "../services/api";

export const usePorts = () => {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const { data } = await getPorts();
        // ✅ Normalize for ShipMap
        const normalized = data.map((p) => ({
          name: p.arrival_port_name,
          lat: Number(p.latitude),
          lng: Number(p.longitude),
        }));
        setPorts(normalized);
      } catch (err) {
        console.error("Error fetching ports:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPorts();
  }, []);

  return { ports, loading, error };
};
