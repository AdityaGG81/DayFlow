import React, { useEffect, useState } from "react";
import client from "../api/client";
import { toast } from "react-toastify";

function HRDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [employees, setEmployees] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard
      const resDash = await client.get("/api/hr/dashboard");
      setDashboard(resDash.data.data);

      // Fetch employees
      const resEmp = await client.get("/api/hr/employees");
      setEmployees(resEmp.data.data);

      // Fetch pending leaves
      const resLeaves = await client.get("/api/hr/leaves/pending");
      setPendingLeaves(resLeaves.data.data);

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

  const handleApprove = async (leaveId) => {
    try {
      await client.patch(`/api/hr/leaves/${leaveId}/approve`);
      toast.success("Leave approved");
      fetchData();
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error(error?.response?.data?.message || "Failed to approve leave");
    }
  };

  const handleReject = async (leaveId) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await client.patch(`/api/hr/leaves/${leaveId}/reject`, {
        reason: rejectReason,
      });
      toast.success("Leave rejected");
      setRejectReason("");
      setRejectingId(null);
      fetchData();
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast.error(error?.response?.data?.message || "Failed to reject leave");
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">HR Dashboard</h1>

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

        {/* Employees Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Employees</h2>
          {employees ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-96">
              {JSON.stringify(employees, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No employee data</p>
          )}
        </div>

        {/* Pending Leaves Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pending Leaves</h2>
          {pendingLeaves && pendingLeaves.length > 0 ? (
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="border rounded-lg p-4 bg-gray-50">
                  <pre className="bg-white p-3 rounded mb-4 text-sm overflow-auto">
                    {JSON.stringify(leave, null, 2)}
                  </pre>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(leave.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded font-medium 
                                 hover:bg-green-700 transition duration-200"
                    >
                      Approve
                    </button>

                    {rejectingId === leave.id ? (
                      <div className="flex gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Rejection reason..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded"
                        />
                        <button
                          onClick={() => handleReject(leave.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded font-medium 
                                     hover:bg-red-700 transition duration-200"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                          className="px-4 py-2 bg-gray-400 text-white rounded font-medium 
                                     hover:bg-gray-500 transition duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRejectingId(leave.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded font-medium 
                                   hover:bg-red-700 transition duration-200"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending leaves</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HRDashboard;
