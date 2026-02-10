import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, SOCKET_URL } from "../config";
export default function EmployeeAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  // 1. Initial Fetch
  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) {
        navigate("/");
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(res.data); // ✅ axios returns data in res.data
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    // 2. Real-time Listener (Optional but good UX)
    import("socket.io-client").then(({ io }) => {
      const socket = io(SOCKET_URL);
      const info = JSON.parse(localStorage.getItem("employeeInfo") || "{}");

      if (info.admin) {
        socket.emit("join_room", info.admin);
        socket.on("announcement", (newAnn) => {
          setAnnouncements(prev => [newAnn, ...prev]);
        });
      }

      return () => socket.disconnect();
    });
  }, []);

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-white/40 dark:bg-zinc-900/60 backdrop-blur-lg border border-white/30 dark:border-white/10 rounded-2xl shadow-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Bell size={28} className="text-yellow-500" />
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-400  ">Announcements</h1>
              <p className="text-sm text-gray-400">Latest updates from your administrator</p>
            </div>
          </div>
        </div>

        {/* FEED */}
        <div className="bg-white/40 dark:bg-zinc-900/60 backdrop-blur-lg border border-white/30 dark:border-white/10 rounded-2xl shadow-xl p-4 sm:p-6 min-h-[50vh]">
          {loading ? (
            <div className="text-center py-10 opacity-60">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-10 opacity-60 italic">No announcements found.</div>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a._id} className="p-4 bg-white/50 dark:bg-zinc-800/50 rounded-xl border border-white/40 shadow-sm transition hover:shadow-md">
                  <p className="text-gray-900 dark:text-gray-100 font-medium text-lg mb-2">{a.message}</p>
                  <p className="text-xs text-gray-500 text-right">
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
