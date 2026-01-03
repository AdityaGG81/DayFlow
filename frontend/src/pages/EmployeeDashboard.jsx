import React, { useEffect, useState } from "react";
import client from "../api/client";
import { toast } from "react-toastify";

function EmployeeDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [leaves, setLeaves] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard
      const resDash = await client.get("/api/employee/dashboard");
      setDashboard(resDash.data.data);

      // Fetch profile
      const resProfile = await client.get("/api/employee/me");
      setProfile(resProfile.data.data);

      // Fetch leaves
      const resLeaves = await client.get("/api/employee/leaves");
      setLeaves(resLeaves.data.data);

      toast.success("Data refreshed");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f2f2f2] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Employee Dashboard</h1>

        <button
          onClick={fetchData}
          disabled={loading}
          className="mb-6 px-4 py-2 bg-black text-white rounded-lg font-medium 
                     hover:bg-gray-800 transition duration-200
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>

        {/* Dashboard Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h2>
          {dashboard ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(dashboard, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No dashboard data</p>
          )}
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Profile</h2>
          {profile ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(profile, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No profile data</p>
          )}
        </div>

        {/* Leaves Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Leaves</h2>
          {leaves ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(leaves, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No leave data</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
