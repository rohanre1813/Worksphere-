import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from "../config";
import { Clock, TrendingUp } from 'lucide-react';

const COLORS = ['#FACC15', '#38BDF8', '#4ADE80', '#F472B6', '#A78BFA'];

export default function AnalyticsSummary({ employeeId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("employeeToken") || localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE_URL}/api/analytics/employee/${employeeId}`, {
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
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) fetchStats();
  }, [employeeId]);

  if (loading) return <div className="text-white/50 text-sm animate-pulse">Loading stats...</div>;
  if (data.length === 0) return <div className="text-white/50 text-sm italic">No activity recorded yet.</div>;

  const totalMinutes = data.reduce((acc, curr) => acc + curr.minutes, 0);

  return (
    <div className="w-full mt-6 bg-black/20 rounded-xl p-4 border border-white/10">
      <style>{`
        .recharts-wrapper { outline: none !important; }
        .recharts-surface { outline: none !important; }
        .recharts-layer { outline: none !important; }
        path, rect, g { outline: none !important; }
      `}</style>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-yellow-400" size={18} />
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">
          Time Distribution (Mins)
        </h3>
        <span className="ml-auto text-xs text-zinc-400">Total: {Math.round(totalMinutes)}m</span>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#e4e4e7" // Light zinc (zinc-200) for better visibility on dark
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={0} // 🔥 Force show all labels
              // 🔥 Rotate labels
              textAnchor="end"
              height={60}  // Increase height to fit rotated labels
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#414040ff', borderColor: '#3f3f46', color: '#fff' }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              trigger="click" // Force click/tap behavior for stability
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
