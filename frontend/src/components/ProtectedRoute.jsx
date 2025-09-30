import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PASSWORD_KEY = "vesselPasswordEntered";

const ProtectedRoute = ({ children }) => {
  const saved = JSON.parse(localStorage.getItem(PASSWORD_KEY));
  const now = new Date().getTime();
  const location = useLocation();

  if (!saved || now > saved.expiry) {
    // Redirect to password page with the original path
    return <Navigate to="/password" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
