import React, { useEffect, useState } from "react";
import DarkNavbar from "../components/DarkNavbar";
import client from "../api/client";

function StatusPill({ status }) {
  const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  if (status === "PRESENT") return <span className={`${base} bg-green-600 text-white`}>Present</span>;
  if (status === "ABSENT") return <span className={`${base} bg-yellow-500 text-black`}>Absent</span>;
  if (status === "ON_LEAVE") return <span className={`${base} bg-purple-700 text-white`}>On leave</span>;
  return <span className={`${base} bg-gray-700 text-white`}>—</span>;
}

export default function Attendance() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await client.get(`/api/hr/attendance?date=${date}`);
        const data = res.data?.data ?? res.data ?? [];
        if (mounted) setRows(data);
      } catch (err) {
        // fallback sample rows
        if (mounted) setRows([
          { userId: 'u1', name: 'Alice Johnson', status: 'PRESENT', checkIn: '09:02', checkOut: '17:12', total: '8h 10m' },
          { userId: 'u2', name: 'Bob Martin', status: 'ON_LEAVE', checkIn: null, checkOut: null, total: '—' },
          { userId: 'u3', name: 'Cara Lee', status: 'ABSENT', checkIn: null, checkOut: null, total: '—' },
        ]);
      }
    })();
    return () => (mounted = false);
  }, [date]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100">
      <DarkNavbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Attendance</div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              className="bg-[#111] text-gray-200 px-3 py-2 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-auto bg-transparent rounded">
          <table className="min-w-full text-left text-sm text-gray-200">
            <thead className="sticky top-0 bg-[#111]">
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3">Check-out</th>
                <th className="px-4 py-3">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.userId} className="border-b border-gray-900 hover:bg-[#0e0e0e]">
                  <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3">{r.checkIn ?? '—'}</td>
                  <td className="px-4 py-3">{r.checkOut ?? '—'}</td>
                  <td className="px-4 py-3">{r.total ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
