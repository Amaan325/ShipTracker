// src/pages/AddVessel/AddVesselForm.jsx
import React from "react";
import VesselAutocomplete from "../../components/AddVessel/VesselAutoComplete";
import SelectField from "../../components/AddVessel/SelectField";
import InputField from "../../components/AddVessel/InputField";
import { useSnackbar } from "notistack";

const AddVesselForm = ({
  vesselCodeQuery,
  selectedVessel,
  mmsi,
  selectedPort,
  selectedEngineer,
  ports,
  engineers,
  submitText,
  loading,
  onVesselInputChange,
  onVesselSelect,
  onPortChange,
  onEngineerChange,
  onSubmit,
  setMmsi,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate MMSI before submitting
    if (!/^[0-9]{9}$/.test(mmsi)) {
      enqueueSnackbar("MMSI must be exactly 9 digits", { variant: "error" });
      return;
    }

    onSubmit(e); // Call parent submit
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
      <VesselAutocomplete
        value={vesselCodeQuery}
        selectedVessel={selectedVessel}
        onChange={onVesselInputChange}
        onSelect={onVesselSelect}
      />

      <SelectField
        value={selectedPort}
        onChange={onPortChange}
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
        onChange={onEngineerChange}
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
  );
};

export default AddVesselForm;