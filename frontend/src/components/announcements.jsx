import { useState, useEffect } from "react";
import { Plus, Megaphone, Trash2 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch from API
  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const addAnnouncement = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/announcements`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setText("");
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ADD ANNOUNCEMENT */}
        <div className="bg-white/40 dark:bg-zinc-900/60 backdrop-blur-lg border border-white/30 dark:border-white/10 rounded-2xl shadow-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={20} className="text-gray-300" />
            <h1 className="text-xl md:text-2xl font-semibold text-gray-400">
              New Announcement
            </h1>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your announcement here..."
            rows={3}
            className="w-full resize-none rounded-xl border bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
          />

          <button
            onClick={addAnnouncement}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-black hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={16} /> {loading ? "Publishing..." : "Publish"}
          </button>
        </div>

        {/* ANNOUNCEMENT LIST */}
        <div className="bg-white/40 dark:bg-zinc-900/60 backdrop-blur-lg border border-white/30 dark:border-white/10 rounded-2xl shadow-xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-400">Announcements</h2>

          {announcements.length === 0 ? (
            <p className="text-black-500">No announcements yet.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div
                  key={a._id}
                  className="rounded-xl border border-white/30 bg-white/40 dark:bg-zinc-800/40 p-4 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-gray-200">
                      {a.message}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAnnouncement(a._id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition ml-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
