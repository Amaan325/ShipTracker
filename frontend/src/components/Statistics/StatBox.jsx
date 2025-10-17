// src/components/StatBox.jsx
import React from "react";
import { motion } from "framer-motion";

const StatBox = ({ title, value, icon: Icon, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg bg-gradient-to-br ${color} text-white`}
    >
      {Icon && <Icon className="text-4xl mb-2 opacity-90" />}
      <h3 className="text-2xl font-bold">{value}</h3>
      <p className="text-sm opacity-90">{title}</p>
    </motion.div>
  );
};

export default StatBox;
