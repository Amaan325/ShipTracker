// src/pages/Statistics.jsx
import React, { useState, useEffect } from "react";
import StatBox from "../components/Statistics/StatBox";
import { FaSatellite, FaGlobe, FaChartLine } from "react-icons/fa";
import { getApiStats } from "../services/api";
import { useSnackbar } from "notistack";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#4F46E5", "#06B6D4"]; // brighter neon indigo & cyan

const Statistics = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalAishubCalls: 0,
    totalVfCalls: 0,
    dailyStats: [],
  });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch stats
  const fetchStats = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await getApiStats(filters.from, filters.to);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching API stats:", err);
      enqueueSnackbar("Failed to load statistics", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilter = () => {
    fetchStats({ from, to });
  };

  const pieData = [
    { name: "AISHUB", value: stats.totalAishubCalls },
    { name: "VF", value: stats.totalVfCalls },
  ];

  return (
    <div className="min-h-screen px-8">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-2xl font-semibold text-gray-800 mb-10 text-center tracking-tight"
      >
        API Analytics Dashboard 🚀
      </motion.h1>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12"
      >
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
        <button
          onClick={handleFilter}
          disabled={loading}
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105"
          } transition-all text-white font-semibold px-6 py-2 rounded-xl shadow-md`}
        >
          {loading ? "Loading..." : "Apply Filter"}
        </button>
      </motion.div>

      {/* Stat Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        <StatBox
          title="Total API Calls"
          value={stats.totalCalls}
          icon={FaChartLine}
          color="from-indigo-500 to-purple-500"
        />
        <StatBox
          title="Total AISHUB Calls"
          value={stats.totalAishubCalls}
          icon={FaSatellite}
          color="from-blue-500 to-cyan-500"
        />
        <StatBox
          title="Total VF Calls"
          value={stats.totalVfCalls}
          icon={FaGlobe}
          color="from-green-500 to-emerald-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* 🔷 Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 
         bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] 
         text-white backdrop-blur-xl p-6 hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]
         transition-all duration-300"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_60%)] pointer-events-none" />

          <h2 className="text-lg font-semibold mb-5 text-center text-white/90 tracking-wide">
            📊 API Calls Trend (Daily)
          </h2>

          <ResponsiveContainer width="100%" height={330}>
            <BarChart
              data={stats.dailyStats}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#CBD5E1" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#CBD5E1" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(99,102,241,0.4)",
                  borderRadius: "12px",
                  color: "#E2E8F0",
                }}
              />
              <Legend
                wrapperStyle={{ color: "#E2E8F0", paddingTop: "10px" }}
                iconType="circle"
              />
              <Bar
                dataKey="AISHUB"
                fill="url(#indigoGradient)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="VF"
                fill="url(#cyanGradient)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
              <defs>
                <linearGradient id="indigoGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 🥧 Pie Chart (matching design) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 
         bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] 
         text-white backdrop-blur-xl p-6 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]
         transition-all duration-300"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.25),transparent_60%)] pointer-events-none"></div>

          <h2 className="text-lg font-semibold mb-5 text-center text-white/90 tracking-wide">
            🥧 API Source Distribution
          </h2>

          <ResponsiveContainer width="100%" height={330}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={65}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
                animationDuration={1200}
              >
                {pieData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === 0 ? "url(#indigoGradient)" : "url(#cyanGradient)"
                    }
                    stroke="#1e293b"
                    strokeWidth={2}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(99,102,241,0.4)",
                  borderRadius: "12px",
                  color: "#E2E8F0",
                  backdropFilter: "blur(6px)",
                }}
              />
              <Legend
                wrapperStyle={{ color: "#E2E8F0", paddingTop: "12px" }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;
