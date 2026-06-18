import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function AttendanceTable({ employeeId }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("employeeToken") || localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/analytics/attendance/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendance(res.data);
      } catch (err) {
        console.error("Attendance fetch error:", err);
        setError("Failed to load attendance logs.");
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetchAttendance();
  }, [employeeId]);

  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateHours = (firstIn, lastOut) => {
    if (!firstIn || !lastOut) return "0h 0m";
    const diffMs = new Date(lastOut) - new Date(firstIn);
    if (diffMs <= 0) return "0h 0m";
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) return <div className="text-zinc-400 mt-6 text-center">Loading attendance...</div>;
  if (error) return <div className="text-red-400 mt-6 text-center">{error}</div>;

  return (
    <div className="mt-8 bg-zinc-900/50 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-zinc-700 w-full overflow-hidden">
      <h3 className="text-lg font-semibold text-white mb-4">Daily Attendance Log</h3>
      
      {attendance.length === 0 ? (
        <p className="text-zinc-400 text-center py-4">No attendance records found.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-black/20">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Date</th>
                <th className="px-4 py-3">First In</th>
                <th className="px-4 py-3">Last Out</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((log, index) => (
                <tr key={index} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{log._id}</td>
                  <td className="px-4 py-3 text-emerald-400">{formatTime(log.firstIn)}</td>
                  <td className="px-4 py-3 text-red-400">{formatTime(log.lastOut)}</td>
                  <td className="px-4 py-3 text-right text-yellow-400 font-mono">
                    {calculateHours(log.firstIn, log.lastOut)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
