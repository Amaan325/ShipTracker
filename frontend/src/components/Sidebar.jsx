import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiMenu, FiX } from "react-icons/fi";
import { LiaShipSolid } from "react-icons/lia";
import { GoPlus } from "react-icons/go";
import { RxPerson } from "react-icons/rx";
import { MdMonitor, MdOutlineAnalytics } from "react-icons/md";
import logo from "../assets/logo.png";
import { getWhatsAppStatus } from "../services/api"; // ✅ import API call

const Sidebar = () => {
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // ✅ Fetch WhatsApp connection status every 10s
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getWhatsAppStatus();
        setIsWhatsAppConnected(res.data.connected);
      } catch (error) {
        console.error("Error fetching WhatsApp status:", error);
        setIsWhatsAppConnected(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // update every 10s
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Add Ship", path: "/", icon: <GoPlus size={18} /> },
    { name: "Ship Details", path: "/ship-details", icon: <LiaShipSolid size={20} /> },
    { name: "Engineer Info", path: "/engineers", icon: <RxPerson size={18} /> },
    { name: "Monitoring", path: "/monitoring", icon: <MdMonitor size={20} /> },
    { name: "Statistics", path: "/statistics", icon: <MdOutlineAnalytics size={20} /> },
  ];

  return (
    <>
      {/* ✅ Desktop Sidebar */}
      <aside
        className={`hidden md:flex ${
          collapsed ? "w-20" : "w-56"
        } bg-white shadow-md border-r flex-col justify-between transition-all mt-6 rounded-xl ml-3 mb-2 duration-300`}
      >
        {/* Top Section */}
        <div>
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <div className="flex items-center gap-2 relative">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <LiaShipSolid size={24} />
              </div>
              {!collapsed && (
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-800">ShipTracker</h2>
                  {/* ✅ WhatsApp Status Dot */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isWhatsAppConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                </div>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-500 hover:text-gray-700"
            >
              {collapsed ? (
                <FiChevronRight size={18} />
              ) : (
                <FiChevronLeft size={18} />
              )}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex flex-col mt-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <div key={item.name} className="px-2">
                  <Link
                    to={item.path}
                    className={`group flex items-center w-full px-3 py-2.5 rounded-md transition 
                      ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-blue-50"
                      } 
                      ${collapsed ? "justify-center" : ""}`}
                  >
                    <div
                      className={`${isActive ? "text-white" : "text-gray-600"}`}
                    >
                      {item.icon}
                    </div>
                    {!collapsed && (
                      <span className="ml-3 text-xs font-medium">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* ✅ Removed WhatsApp status text section */}

        {/* User Info */}
        <div className="flex items-center gap-2 px-4 py-4 border-t ">
          <div className="w-24 h-12 rounded-full flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo" className="rounded-full" />
          </div>

          {!collapsed && (
            <div>
              <p className="text-xs font-medium text-gray-800">Captain Smith</p>
              <p className="text-[11px] text-gray-500">Harbor Master</p>
            </div>
          )}
        </div>
      </aside>

      {/* ✅ Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white shadow-md z-[3000]">
        <div className="flex items-center justify-between px-4 py-3 border-b relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <LiaShipSolid size={20} />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">ShipTracker</h2>
            {/* ✅ Add dot here for mobile as well */}
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isWhatsAppConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-gray-600"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          {/* Animated Dropdown menu */}
          <div
            className={`absolute right-2 top-12 w-48 bg-white rounded-lg shadow-lg border overflow-hidden transform transition-all duration-200 origin-top-right 
              ${
                mobileOpen
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-0 pointer-events-none"
              }`}
          >
            {navItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)} // ✅ Close menu after click
                  className={`flex items-center gap-3 px-4 py-2 text-sm transition 
                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                >
                  <div>{item.icon}</div>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
