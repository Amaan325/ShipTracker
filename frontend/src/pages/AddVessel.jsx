// src/pages/AddVessel/AddVessel.jsx
import React from "react";
import { useAddVessel } from "../hooks/useAddVessel";
import AddVesselForm from "../components/AddVessel/AddVesselForm";

const AddVessel = () => {
  const {
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
  } = useAddVessel();

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white shadow-lg rounded-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Add Vessel</h2>
      <AddVesselForm
        vesselCodeQuery={vesselCodeQuery}
        selectedVessel={selectedVessel}
        mmsi={mmsi}
        selectedPort={selectedPort}
        selectedEngineer={selectedEngineer}
        ports={ports}
        engineers={engineers}
        submitText={submitText}
        loading={loading}
        onVesselInputChange={handleVesselInputChange}
        onVesselSelect={handleVesselSelect}
        onPortChange={handlePortChange}
        onEngineerChange={handleEngineerChange}
        onSubmit={handleSubmit}
        setMmsi={setMmsi}
      />
    </div>
  );
};

export default AddVessel;
