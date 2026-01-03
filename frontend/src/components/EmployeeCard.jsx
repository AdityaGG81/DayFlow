import React from "react";
import { Link } from "react-router-dom";

function StatusBadge({ status }) {
  if (status === "PRESENT") return <span className="inline-block w-3 h-3 rounded-full bg-green-400" />;
  if (status === "ABSENT") return <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" />;
  if (status === "ON_LEAVE") return <span className="inline-block text-xs">✈️</span>;
  return <span className="inline-block w-3 h-3 rounded-full bg-gray-500" />;
}

export default function EmployeeCard({ employee }) {
  const initials = employee?.name?.split(" ").map((s) => s[0]).slice(0,2).join("");

  return (
    <Link to={`/hr/employees/${employee.userId}`} className="block">
      <div className="relative bg-[#1a1a1a] rounded-lg p-4 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-150 border border-transparent hover:border-purple-600">
        <div className="absolute right-3 top-3">
          <StatusBadge status={employee.workStatus} />
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white text-lg font-medium">
            {initials || "?"}
          </div>
          <div>
            <div className="text-white font-semibold">{employee.name}</div>
            <div className="text-sm text-gray-400">{employee.designation} • {employee.department}</div>
            <div className="text-xs text-gray-500 mt-2">{employee.email}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
