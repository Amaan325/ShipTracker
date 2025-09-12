import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";

import AddVessel from "./pages/AddVessel";
import EngineerForm from "./pages/EngineerForm";
import ShipDetails from "./pages/ShipDetails";
import Sidebar from "./components/Sidebar";
import Monitoring from "./pages/Monitoring"; // ✅ Imported Monitoring page

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex min-h-screen bg-gray-100">
          {/* Sidebar always visible */}
          <Sidebar />

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<AddVessel />} />
              <Route path="/engineers" element={<EngineerForm />} />
              <Route path="/ship-details" element={<ShipDetails />} />
              <Route path="/monitoring" element={<Monitoring />} />

            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
};

export default App;