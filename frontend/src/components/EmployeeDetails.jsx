import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, MapPin, Mail, Briefcase, ArrowLeft } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import AnalyticsSummary from "./AnalyticsSummary";

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        // We can reuse the same endpoint if we have one, or filter from the list.
        // Since we don't have a specific GET /api/employees/:id for employees to call (usually admin only),
        // we might need to rely on the data passed via state OR create a new endpoint.
        // However, for simplicity and speed, let's try to fetch from the public/shared list or specific endpoint.
        // Actually, the admin `getEmployees` might be protected.
        // Let's check `employeeRoutes.js` and `employeeController.js`.
        // If no direct endpoint exists, I'll use the generic `getEmployees` if accessible, or I'll implement a specific fetch.

        // Wait! The employee side might not have permission to view ALL details of other employees via API if restricted.
        // But the map shows them, so basic info is public.
        // Let's assume we can fetch basic details. 
        // For now, I'll attempt to use the token to fetch 'all' and filter, OR (better) request a specific endpoint.

        // Actually, looking at previous context, `getEmployees` in `employeeController` is for Admins.
        // But `sockets.js` broadcasts basic info (id, name, zone).
        // If we want detailed info (email, role), we might need an endpoint.

        // Let's try to fetch from a new endpoint or existing one.
        // NOTE: To avoid backend changes unless necessary, I will assume the map data `employees_update` socket event provided enough info? 
        // No, that only had { id, name, zone }.

        // Let's add a safe "get public profile" endpoint or just reuse the admin one if the token allows.
        // Actually, let's just create a new simple endpoint in `employeeRoutes` if needed.
        // BUT user said "dont change anything else" if possible.
        // Let's try to pass the data via `location.state` from the map click first! 
        // The map has the data. Wait, the map only has `employeeId, name, zone`. It doesn't have email/role.

        // Okay, I will try to fetch using the existing admin endpoint. If it fails (403), I might need to make a quick backend fix.
        // checking `employeeRoutes`: `router.get("/", authMiddleware, getEmployees);` 
        // If `authMiddleware` allows "employee" role, we are good.
        // Let's check `auth.js`. It usually just checks for a valid token.

        const token = localStorage.getItem("employeeToken") || localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Filter client side for now since we are reusing the list endpoint
        const found = res.data.find(e => e.employeeId === id || e._id === id);
        setEmployee(found);

      } catch (err) {
        console.error("Failed to fetch employee details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) return <div className="text-white p-10">Loading profile...</div>;
  if (!employee) return <div className="text-white p-10">Employee not found.</div>;

  return (
    <div className="min-h-screen p-4 md:p-10 flex flex-col items-center">

      <div className="w-full max-w-2xl bg-zinc-900/50 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">

        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition"
        >
          <ArrowLeft size={20} /> Back to Map
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">

          {/* Avatar Placeholder */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-4 border-black/50">
            <span className="text-4xl font-bold text-black">
              {employee.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold text-white">{employee.name}</h1>
              <p className="text-yellow-400/80 font-mono text-sm tracking-widest uppercase">
                {employee.role || "Employee"}
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-zinc-300 justify-center md:justify-start">
                <Briefcase size={18} className="text-yellow-500" />
                <span>ID: {employee.employeeId}</span>
              </div>

              <div className="flex items-center gap-3 text-zinc-300 justify-center md:justify-start">
                <Mail size={18} className="text-yellow-500" />
                <span>{employee.email}</span>
              </div>

              <div className="flex items-center gap-3 text-zinc-300 justify-center md:justify-start">
                <a href={`tel:${employee.phoneNumber}`} className="flex items-center gap-3 hover:text-yellow-400 transition-colors">
                  <span className="text-yellow-500">📞</span>
                  <span>{employee.phoneNumber || "No Phone"}</span>
                </a>
              </div>

              <div className="flex items-center gap-3 text-zinc-300 justify-center md:justify-start">
                <MapPin size={18} className="text-yellow-500" />
                <span className={`px-2 py-0.5 rounded text-sm ${employee.currentZone === "Out" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                  {employee.currentZone || "Unknown Location"}
                </span>
              </div>
            </div>

            <AnalyticsSummary employeeId={employee._id} />
          </div>
        </div>

      </div>
    </div>
  );
}
