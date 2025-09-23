import { useState, useEffect, useRef } from "react";
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

  // Prevent duplicate calls in Strict Mode
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!mmsi || hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      setLoading(true);
      setConflict(false);

      console.log("🔎 Fetching AIS data for MMSI:", mmsi);

      try {
        const res = await getVesselDetails(mmsi);
        console.log("📡 AIS Hub Response:", res.data);

        let vesselData = null;
        if (!res.data.success) {
          if (res.data.status === "too_frequent") {
            enqueueSnackbar("Too many requests. Please try again in 1 minute.", {
              variant: "warning",
            });
            vesselData = currentVessel ? { ...currentVessel } : { mmsi };
            console.log("⚠️ Too frequent — fallback vesselData:", vesselData);
          } else if (res.data.status === "no_data") {
            enqueueSnackbar("No AIS data available for this vessel.", {
              variant: "info",
            });
            console.log("ℹ️ No AIS data returned for MMSI:", mmsi);
            return;
          } else {
            enqueueSnackbar(res.data.message || "Unknown AIS Hub error", {
              variant: "error",
            });
            console.log("❌ AIS Hub error response:", res.data);
            return;
          }
        } else {
          vesselData = { ...currentVessel, ...res.data.vessel };
          console.log("✅ Merged vesselData:", vesselData);
        }

        if (!vesselData) {
          console.log("⛔ No vesselData built, skipping update");
          return;
        }

        setData(vesselData);

        console.log("📦 CurrentVessel in Redux:", currentVessel);
        console.log("📦 New vesselData to compare:", vesselData);

        if (JSON.stringify(currentVessel) !== JSON.stringify(vesselData)) {
          console.log("🔄 Updating Redux currentVessel with:", vesselData);
          dispatch(setCurrentVessel(vesselData));
        } else {
          console.log("⏩ No Redux update needed (same vesselData)");
        }

        const saveRes = await saveOrCheckVessel(vesselData);
        console.log("💾 Save/Check Vessel Response:", saveRes?.data);

        if (saveRes?.data?.conflict) {
          console.log("⚔️ Conflict detected:", saveRes.data);
          setConflict(saveRes.data);
        }
      } catch (err) {
        console.error("🚨 AIS Hub API error:", err);
        enqueueSnackbar("Failed to fetch AIS Hub data.", { variant: "error" });
      } finally {
        setLoading(false);
        console.log("✅ Fetch finished for MMSI:", mmsi);
      }
    };

    fetchData();
  }, [mmsi, dispatch, enqueueSnackbar]); // ❌ removed currentVessel

  return { data: data || currentVessel, loading, conflict };
};
