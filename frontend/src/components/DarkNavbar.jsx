import React from "react";
import { NavLink } from "react-router-dom";

export default function DarkNavbar() {
  const linkClass = ({ isActive }) =>
    `text-sm px-3 py-2 rounded ${isActive ? "bg-gray-800" : "hover:bg-gray-900"}`;

  return (
    <header className="w-full bg-[#0f0f0f] border-b border-gray-800 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="text-lg font-semibold">CompanyLogo</div>
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/hr/employees" className={linkClass}>Employees</NavLink>
            <NavLink to="/hr/attendance" className={linkClass}>Attendance</NavLink>
            <NavLink to="/hr/timeoff" className={linkClass}>Time Off</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <input
              aria-label="global-search"
              className="bg-[#111] text-sm px-3 py-2 rounded placeholder-gray-400 w-56"
              placeholder="Search…"
              disabled
            />
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-xs font-semibold">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
