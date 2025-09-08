// src/components/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { LiaShipSolid } from "react-icons/lia";
import { GoPlus } from "react-icons/go";
import { RxPerson } from "react-icons/rx";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      name: "Add Ship",
      path: "/",
      icon: <GoPlus size={18} />,
    },
    {
      name: "Ship Details",
      path: "/ship-details",
      icon: <LiaShipSolid size={20} />,
    },
    {
      name: "Engineer Info",
      path: "/engineers",
      icon: <RxPerson size={18} />,
    },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-56"
      } bg-white shadow-md border-r flex flex-col justify-between transition-all mt-6 rounded-xl ml-3 mb-2 duration-300`}
    >
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <LiaShipSolid size={24} />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  ShipTracker
                </h2>
                <p className="text-xs text-gray-500">Marine Ops</p>
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
    ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"} 
    ${collapsed ? "justify-center" : ""}`}
                >
                  <div
                    className={`${isActive ? "text-white" : "text-gray-600"}`} // ✅ removed group-hover:text-white
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

      {/* User Info */}
      <div className="flex items-center gap-2 px-4 py-4 border-t">
        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm">
          👨‍✈️
        </div>
        {!collapsed && (
          <div>
            <p className="text-xs font-medium text-gray-800">Captain Smith</p>
            <p className="text-[11px] text-gray-500">Harbor Master</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
