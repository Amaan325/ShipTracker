// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";

import Navbar from "./components/Navbar";
import AddVessel from "./pages/AddVessel";
import EngineerForm from "./pages/EngineerForm";
import ShipDetails from "./pages/ShipDetails";

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="p-6">
            <Routes>
              <Route path="/" element={<AddVessel />} />
              <Route path="/engineer" element={<EngineerForm />} />
              <Route path="/ship-details" element={<ShipDetails />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
