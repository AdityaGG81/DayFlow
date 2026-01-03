import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function EmployeeLayout() {
  const [open, setOpen] = useState(false);
  const { user, refreshMe } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await client.post("/api/auth/logout");
    } catch (err) {}
    try {
      await refreshMe();
    } catch (e) {}
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className={`bg-white border-r w-64 p-4 hidden md:block`}>
        <div className="text-lg font-semibold mb-6">Employee</div>
        <nav className="flex flex-col gap-2">
          <Link to="/employee" className="px-3 py-2 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/employee/me" className="px-3 py-2 rounded hover:bg-gray-100">My Profile</Link>
          <Link to="/employee/leaves" className="px-3 py-2 rounded hover:bg-gray-100">My Leaves</Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-white px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded bg-gray-100"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <div className="text-lg font-semibold">Employee</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <div>{user?.name ?? "—"}</div>
              <div className="text-xs text-gray-400">{user?.role ?? "—"}</div>
            </div>
            <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-500 text-white text-sm">Logout</button>
          </div>
        </header>

        {open && (
          <div className="md:hidden bg-white border-b p-4">
            <nav className="flex flex-col gap-2">
              <Link to="/employee" className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/employee/me" className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => setOpen(false)}>My Profile</Link>
              <Link to="/employee/leaves" className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => setOpen(false)}>My Leaves</Link>
              <button onClick={handleLogout} className="mt-2 px-3 py-2 rounded bg-red-500 text-white">Logout</button>
            </nav>
          </div>
        )}

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
