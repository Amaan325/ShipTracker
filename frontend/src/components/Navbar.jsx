import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex space-x-6">
      <Link to="/" className="font-bold hover:text-gray-200">
        Add VesselTracking
      </Link>
      <Link to="/engineer" className="font-bold hover:text-gray-200">
        EngineerInfo
      </Link>
      <Link to="/ship-details" className="font-bold hover:text-gray-200">
        ShipDetails
      </Link>
    </nav>
  );
};

export default Navbar;
