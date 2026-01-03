import React, { useEffect, useState, useMemo } from "react";
import DarkNavbar from "../components/DarkNavbar";
import EmployeeCard from "../components/EmployeeCard";
import client from "../api/client";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await client.get("/api/hr/employees");
        const data = res.data?.data ?? res.data ?? [];
        if (mounted) setEmployees(data);
      } catch (err) {
        // fallback mock data
        if (mounted) setEmployees([
          { userId: "u1", name: "Alice Johnson", email: "alice@example.com", department: "Engineering", designation: "Frontend Engineer", workStatus: "PRESENT" },
          { userId: "u2", name: "Bob Martin", email: "bob@example.com", department: "HR", designation: "HR Manager", workStatus: "ON_LEAVE" },
          { userId: "u3", name: "Cara Lee", email: "cara@example.com", department: "Sales", designation: "Account Exec", workStatus: "ABSENT" },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const filtered = useMemo(() => {
    if (!q) return employees;
    const t = q.toLowerCase();
    return employees.filter(e => (e.name + " " + e.email + " " + e.department + " " + e.designation).toLowerCase().includes(t));
  }, [q, employees]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100">
      <DarkNavbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button className="bg-gradient-to-tr from-purple-600 to-blue-600 text-white px-4 py-2 rounded shadow">NEW</button>
            <div className="text-sm text-gray-400">Employees</div>
          </div>

          <div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-[#111] text-gray-200 px-3 py-2 rounded w-72 placeholder-gray-500"
              placeholder="Search employees by name, email, role..."
            />
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(emp => (
              <EmployeeCard key={emp.userId} employee={emp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
