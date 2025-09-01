import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { getVesselDetails, saveOrCheckVessel } from "../services/api";
import { setCurrentVessel } from "../redux/vesselSlice";

export const useAisData = (mmsi) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(false);

  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const currentVessel = useSelector((state) => state.vessel.currentVessel);

  useEffect(() => {
    if (!mmsi) return;

    const fetchData = async () => {
      setLoading(true);
      setConflict(false);

      try {
        const res = await getVesselDetails(mmsi);

        if (!res.data.success) {
          if (res.data.status === "too_frequent") {
            enqueueSnackbar("Too many AIS Hub requests, using cached data.", {
              variant: "warning",
            });
            return;
          }

          if (res.data.status === "no_data") {
            enqueueSnackbar("No AIS data available for this vessel.", {
              variant: "info",
            });
            return;
          }

          enqueueSnackbar(res.data.message || "Unknown AIS Hub error", {
            variant: "error",
          });
          return;
        }
        const mergedVessel = { ...currentVessel, ...res.data.vessel };
        setData(mergedVessel);
        console.log("Merged Vessel", mergedVessel)

        if (JSON.stringify(currentVessel) !== JSON.stringify(mergedVessel)) {
          dispatch(setCurrentVessel(mergedVessel));
        }

        const saveRes = await saveOrCheckVessel(mergedVessel);
        console.log("💾 Save/Check Vessel Response:", saveRes.data);

        if (saveRes?.data?.conflict) {
          console.log("🚨 Vessel conflict detected!");
          setConflict(saveRes.data); // now conflict = { conflict: true, vessel: { ... } }
        }
      } catch (err) {
        console.error("AIS Hub API error:", err);
        enqueueSnackbar("Failed to fetch AIS Hub data.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mmsi, currentVessel, dispatch, enqueueSnackbar]);

  return { data: data || currentVessel, loading, conflict };
};
