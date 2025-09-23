// src/components/AddVessel/AddVesselForm.jsx
import React, { useCallback } from "react";
import VesselAutocomplete from "./VesselAutoComplete";
import SelectField from "../common/SelectField";
import InputField from "../common/InputField";
import { useSnackbar } from "notistack";
import { IoLocationOutline } from "react-icons/io5";
import { LiaShipSolid } from "react-icons/lia";
import { RxPerson } from "react-icons/rx";

const Section = React.memo(({ icon: Icon, title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4 w-full">
    <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      <Icon size={20} className="text-blue-600" />
      {title}
    </h2>
    {children}
  </div>
));

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

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!/^\d{9}$/.test(mmsi)) {
        enqueueSnackbar("MMSI must be exactly 9 digits", { variant: "error" });
        return;
      }
      onSubmit(e);
    },
    [mmsi, enqueueSnackbar, onSubmit]
  );

  return (
    <form
      className="flex flex-col space-y-6 px-0 md:px-0 w-full"
      onSubmit={handleSubmit}
    >
      {/* Ship Info */}
      <Section icon={LiaShipSolid} title="Ship Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <VesselAutocomplete
            label="Ship Name *"
            value={vesselCodeQuery}
            selectedVessel={selectedVessel}
            onChange={onVesselInputChange}
            onSelect={onVesselSelect}
            placeholder="Enter ship name"
          />

          <InputField
            label="MMSI Number *"
            type="number"
            placeholder="e.g., 123456789"
            value={mmsi}
            onChange={(e) => setMmsi(e.target.value)}
            required
            readOnly={!!selectedVessel}
          />
        </div>

        <InputField
          label="IMO Number *"
          type="text"
          value={selectedVessel?.imo || ""}
          readOnly
        />
      </Section>

      {/* Engineer */}
      <Section icon={RxPerson} title="Engineer Assignment">
        <SelectField
          label="Assign Engineer"
          value={selectedEngineer}
          onChange={onEngineerChange}
          options={engineers}
          placeholder="Select an engineer"
          required
        />
      </Section>

      {/* Route */}
      <Section icon={IoLocationOutline} title="Route Information">
        <SelectField
          label="Expected Arrival Port"
          value={selectedPort}
          onChange={onPortChange}
          options={ports}
          placeholder="Select expected arrival port"
          required
        />
      </Section>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          className={`bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition text-xs font-medium shadow ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {submitText}
        </button>
      </div>
    </form>
  );
};

export default React.memo(AddVesselForm);
