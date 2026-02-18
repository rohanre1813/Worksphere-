import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from "../config";
import { TrendingUp, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLORS = ['#FACC15', '#38BDF8', '#4ADE80', '#F472B6', '#A78BFA'];



export default function OfficeAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/analytics/office`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Format data for chart
      const formatted = res.data.map(item => ({
        name: item._id,
        minutes: Math.round(item.totalMinutes * 10) / 10, // Round to 1 decimal
        visits: item.visitCount
      }));

      setData(formatted);
    } catch (err) {
      console.error("Failed to fetch office analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">Delete ALL analytics data?</span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              performDelete();
              toast.dismiss(t.id);
            }}
            className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 text-black text-xs px-3 py-1 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const performDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/analytics/office`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setData([]);
      toast.success("Analytics data cleared.");
    } catch (err) {
      toast.error("Failed to delete data");
      console.error(err);
    }
  };

  if (loading) return <div className="text-black/50 text-sm animate-pulse">Loading office stats...</div>;
  if (data.length === 0) return <div className="text-black/50 text-sm italic">No office activity recorded yet.</div>;

  const totalMinutes = data.reduce((acc, curr) => acc + curr.minutes, 0);



  return (
    <div className="w-full mt-6 bg-white/40 border border-white/30 rounded-xl p-4 shadow-sm">
      <style>{`
        .recharts-wrapper { outline: none !important; }
        .recharts-surface { outline: none !important; }
        .recharts-layer { outline: none !important; }
        path, rect, g { outline: none !important; }
      `}</style>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-blue-600" size={18} />
        <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wider">
          Office-Wide Time Distribution (Mins)
        </h3>
        <span className="ml-auto text-xs text-gray-500">Total: {Math.round(totalMinutes)}m</span>

        <button
          onClick={handleDelete}
          className="ml-4 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Clear Analytics Data"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={0}
              height={60}
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <text x={0} y={0} dy={16} textAnchor="middle" fill="#52525b" fontSize={10}>
                    {payload.value.split(" ").map((word, i) => (
                      <tspan key={i} x={0} dy={i ? 12 : 0}>{word}</tspan>
                    ))}
                  </text>
                </g>
              )}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#505050ff', borderColor: '#080808ff', color: '#fffefeff' }}
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              trigger="click"
            />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
