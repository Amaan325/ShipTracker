import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const PASSWORD_KEY = "vesselPasswordEntered";
const USERNAME = import.meta.env.VITE_APP_USERNAME;
const PASSWORD = import.meta.env.VITE_APP_PASSWORD;
const EXPIRY_MS = (import.meta.env.VITE_APP_EXPIRY_DAYS || 7) * 24 * 60 * 60 * 1000;


const Password = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const from = state?.from?.pathname || "/";

  // ✅ Check saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem(PASSWORD_KEY);
    if (saved) {
      try {
        const { expiry } = JSON.parse(saved);
        if (Date.now() < expiry) navigate(from, { replace: true });
      } catch {
        localStorage.removeItem(PASSWORD_KEY);
      }
    }
  }, [from, navigate]);

  // ✅ Form submit
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (username !== USERNAME) {
        enqueueSnackbar("Incorrect username", { variant: "error" });
        return;
      }

      if (password !== PASSWORD) {
        enqueueSnackbar("Incorrect password", { variant: "error" });
        return;
      }

      // Save expiry
      const expiry = Date.now() + EXPIRY_MS;
      localStorage.setItem(PASSWORD_KEY, JSON.stringify({ expiry }));

      enqueueSnackbar("Access granted! Redirecting...", {
        variant: "success",
        autoHideDuration: 1000,
      });
      setUnlocked(true);
      setTimeout(() => navigate(from, { replace: true }), 800);
    },
    [username, password, enqueueSnackbar, from, navigate]
  );

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <AnimatePresence>
        {!unlocked && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.8 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative w-full max-w-md p-10 rounded-2xl shadow-2xl 
                       bg-white/70 backdrop-blur-xl border border-gray-200"
          >
            <img
              src={logo}
              alt="Logo"
              className="mx-auto mb-8 w-[400px] h-28 object-contain"
              loading="lazy"
              decoding="async"
            />

            <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">
              Secure Access
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              Please enter your credentials to continue
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
                           outline-none text-gray-700 text-md transition shadow-sm"
              />

              {/* Password Field */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
                           outline-none text-gray-700 text-md transition shadow-sm"
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 
                           text-white font-semibold text-lg shadow-md
                           hover:from-blue-700 hover:to-blue-800 
                           transform hover:scale-[1.03] transition-all duration-300"
              >
                Unlock
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(Password);
