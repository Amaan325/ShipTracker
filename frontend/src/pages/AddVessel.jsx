import React from "react";
import { useAddVessel } from "../hooks/useAddVessel";
import AddVesselForm from "../components/AddVessel/AddVesselForm";
import { LiaShipSolid } from "react-icons/lia";

const AddVessel = () => {
  const addVesselHook = useAddVessel();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 ml-12">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
              <LiaShipSolid size={28} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Add New Ship</h1>
              <p className="text-gray-500 text-sm">Register a new vessel in the tracking system</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-100 px-6 rounded-2xl -mt-9">
            <AddVesselForm {...addVesselHook} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddVessel;