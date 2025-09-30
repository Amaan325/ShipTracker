import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";

import AddVessel from "./pages/AddVessel";
import EngineerForm from "./pages/EngineerForm";
import ShipDetails from "./pages/ShipDetails";
import Monitoring from "./pages/Monitoring";
import Password from "./pages/Password";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public route: Password page */}
          <Route path="/password" element={<Password />} />

          {/* All other routes protected */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen bg-gray-100">
                  <Sidebar />
                  <main className="flex-1 p-6 overflow-auto">
                    <Routes>
                      <Route path="/" element={<AddVessel />} />
                      <Route path="/engineers" element={<EngineerForm />} />
                      <Route path="/ship-details" element={<ShipDetails />} />
                      <Route path="/monitoring" element={<Monitoring />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
