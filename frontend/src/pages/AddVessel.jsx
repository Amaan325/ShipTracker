// src/pages/AddVessel.jsx
import React from "react";
import { useAddVessel } from "../hooks/useAddVessel";
import AddVesselForm from "../components/AddVessel/AddVesselForm";
import { LiaShipSolid } from "react-icons/lia";

const AddVessel = () => {
  const addVesselHook = useAddVessel();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 pt-20 md:pt-0  md:px-8">
        {/* ✅ On desktop, keep centered container.
            On mobile, use full width like EngineerForm */}
        <div className="w-full md:max-w-3xl md:mx-auto">
          {/* Header */}
          <header className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow">
              <LiaShipSolid size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Add New Ship
              </h1>
              <p className="text-gray-500 text-sm">
                Register a new vessel in the tracking system
              </p>
            </div>
          </header>

          {/* Form */}
          <AddVesselForm {...addVesselHook} />
        </div>
      </main>
    </div>
  );
};

export default AddVessel;
