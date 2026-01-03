import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function HRLayout() {
  const [open, setOpen] = useState(false);
  const { user, refreshMe } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await client.post("/api/auth/logout");
    } catch (err) {
      // ignore errors
    }
    try {
      await refreshMe();
    } catch (e) {}
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className={`bg-white border-r w-64 p-4 hidden md:block`}>
        <div className="text-lg font-semibold mb-6">HR Panel</div>
        <nav className="flex flex-col gap-2">
          <Link to="/hr" className="px-3 py-2 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/hr/employees" className="px-3 py-2 rounded hover:bg-gray-100">Employees</Link>
          <Link to="/hr/leaves" className="px-3 py-2 rounded hover:bg-gray-100">Leave Requests</Link>
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
            <div className="text-lg font-semibold">HR</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <div>{user?.name ?? "—"}</div>
              <div className="text-xs text-gray-400">{user?.role ?? "—"}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-red-500 text-white text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {open && (
          <div className="md:hidden bg-white border-b p-4">
            <nav className="flex flex-col gap-2">
              <Link to="/hr" className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/hr/employees" className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => setOpen(false)}>Employees</Link>
              <Link to="/hr/leaves" className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => setOpen(false)}>Leave Requests</Link>
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
