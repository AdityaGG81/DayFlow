import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useNavigate } from "react-router-dom";

const StatusDot = ({ status }) => {
  const color =
    status === "PRESENT"
      ? "bg-green-500"
      : status === "LEAVE"
      ? "bg-blue-400"
      : "bg-yellow-400";

  return (
    <span
      className={`absolute top-3 right-3 w-3 h-3 rounded-full ${color}`}
    />
  );
};

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    client.get("/api/hr/employees").then((res) => {
      setEmployees(res.data.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button className="bg-purple-600 px-4 py-2 rounded text-sm">
          NEW
        </button>

        <input
          placeholder="Search"
          className="bg-[#1a1a1a] border border-gray-700 px-4 py-2 rounded w-64 text-sm"
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {employees.map((emp) => (
          <div
            key={emp.userId}
            onClick={() => navigate(`/employee/${emp.userId}`)}
            className="relative bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-white transition"
          >
            <StatusDot status={emp.workStatus} />

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-600 rounded flex items-center justify-center">
                👤
              </div>

              <span className="text-sm text-center">
                {emp.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
