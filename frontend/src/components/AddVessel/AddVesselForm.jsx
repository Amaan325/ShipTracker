import React, { useCallback, useEffect } from "react";
import VesselAutocomplete from "./VesselAutoComplete";
import SelectField from "../common/SelectField";
import InputField from "../common/InputField";
import { useSnackbar } from "notistack";
import { IoLocationOutline } from "react-icons/io5";
import { LiaShipSolid } from "react-icons/lia";
import { RxPerson } from "react-icons/rx";
import { MdLabelOutline } from "react-icons/md";

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
  selectedEngineers,
  ports,
  engineers,
  label,
  setLabel,
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

  // 🧭 Log prop updates
  useEffect(() => {
    console.log("🧭 FORM PROPS → label:", label);
  }, [label]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log("🧭 handleSubmit triggered with label:", label);

      if (!/^\d{9}$/.test(mmsi)) {
        enqueueSnackbar("MMSI must be exactly 9 digits", { variant: "error" });
        return;
      }

      onSubmit(e);
    },
    [mmsi, enqueueSnackbar, onSubmit, label]
  );

  return (
    <form
      className="flex flex-col space-y-6 px-0 md:px-0 w-full"
      onSubmit={handleSubmit}
    >
      {/* 🚢 Ship Info */}
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
      </Section>

      {/* 🏷️ Label Section */}
      <Section icon={MdLabelOutline} title="Vessel Label / Category">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Purpose Label
            </label>
            <select
              value={label}
              onChange={(e) => {
                console.log("🧭 Label changed →", e.target.value);
                setLabel(e.target.value);
              }}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg shadow-sm px-4 py-2 text-left text-sm text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
              required
            >
              <option value="Repair">Repair</option>
              <option value="Install">Install</option>
              <option value="Delivery/Collection">Delivery/Collection</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </Section>

      {/* 👷 Engineer Assignment */}
      <Section icon={RxPerson} title="Engineer Assignment">
        <div className="space-y-3">
          {/* Selected Engineers */}
          <div className="flex flex-wrap gap-2">
            {selectedEngineers.length > 0 ? (
              selectedEngineers.map((eng) => (
                <span
                  key={eng._id}
                  className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-sm"
                >
                  {eng.engineer_name}
                  <button
                    type="button"
                    onClick={() =>
                      onEngineerChange(
                        selectedEngineers.filter((e) => e._id !== eng._id)
                      )
                    }
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ✕
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">
                No engineers selected
              </span>
            )}
          </div>

          {/* Engineer Dropdown */}
          <div className="relative inline-block w-full">
            <button
              type="button"
              className="w-full bg-gray-100 border border-gray-300 rounded-lg shadow-sm px-4 py-2 text-left text-sm text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
              onClick={(e) => {
                e.preventDefault();
                const dropdown = e.currentTarget.nextSibling;
                dropdown.classList.toggle("hidden");
              }}
            >
              Select Engineers
              <svg
                className="w-4 h-4 ml-2 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto hidden">
              {engineers.map((eng) => {
                const isSelected = selectedEngineers.some(
                  (e) => e._id === eng._id
                );
                return (
                  <label
                    key={eng._id}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          onEngineerChange(
                            selectedEngineers.filter((e) => e._id !== eng._id)
                          );
                        } else {
                          onEngineerChange([...selectedEngineers, eng]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{eng.engineer_name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* 📍 Route Section */}
      <Section icon={IoLocationOutline} title="Route Information">
        <SelectField
          label="Expected Arrival Port"
          value={selectedPort}
          onChange={onPortChange}
          options={ports}
          placeholder="Select expected arrival port"
          required
          getOptionLabel={(p) => p.arrival_port_name}
          getOptionValue={(p) => p._id}
        />
      </Section>

      {/* 🚀 Submit Button */}
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
