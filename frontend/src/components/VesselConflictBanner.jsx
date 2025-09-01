import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { deactivateVessel, saveOrCheckVessel } from "../services/api";
import { setCurrentVessel } from "../redux/vesselSlice";

const VesselConflictBanner = ({ conflict, onClose }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const currentVessel = useSelector((state) => state.vessel.currentVessel);

  if (!conflict) return null;

  const handleDeactivate = async () => {
    try {
      // 🗑️ Delete vessel from DB
      await deactivateVessel(conflict.vessel.mmsi);
      enqueueSnackbar("Vessel deleted successfully!", { variant: "success" });

      // 💾 Re-save vessel from Redux data (to track again automatically)
      if (currentVessel) {
        const saveRes = await saveOrCheckVessel(currentVessel);
        if (saveRes?.data?.success) {
          enqueueSnackbar("Vessel re-tracked successfully!", { variant: "success" });
          dispatch(setCurrentVessel(saveRes.data.vessel));
        } else {
          enqueueSnackbar("Failed to re-track vessel.", { variant: "error" });
        }
      }

      onClose();
    } catch (err) {
      console.error("Failed to deactivate vessel:", err);
      enqueueSnackbar("Failed to delete vessel.", { variant: "error" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred semi-transparent background */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-xl p-6 border border-red-800 max-w-md w-full text-center">
        <h3 className="text-2xl font-bold mb-3">⚠️ Vessel Conflict Detected</h3>
        <p className="text-lg mb-5">
          This vessel is already being tracked elsewhere.{" "}
          <span className="font-semibold">Deactivate tracking</span> to continue.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDeactivate}
            className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            Deactivate & Track
          </button>
        </div>
      </div>
    </div>
  );
};

export default VesselConflictBanner;
