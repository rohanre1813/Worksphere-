import { Pencil, X, MapPin, Bell, CalendarCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnalyticsSummary from "./AnalyticsSummary";

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const info = localStorage.getItem("employeeInfo");



    if (!info) {
      navigate("/");
      return;
    }
    setEmployee(JSON.parse(info));
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black">
        Loading employee info...
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 relative">
      <div className="relative max-w-4xl mx-auto">
        {/* Employee Info Card */}
        <div className="bg-white/40 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl md:text-2xl font-semibold">
              Employee Dashboard
            </h1>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {console.log(employee)}

            <Info label="Name" value={employee.name} icon={<User size={18} />} />
            <Info label="Role" value={employee.role} icon={<MapPin size={18} />} />
            <Info label="Employee ID" value={employee.employeeId} icon={<CalendarCheck size={18} />} />
            <Info label="Email" value={employee.email} icon={<Bell size={18} />} />
          </div>

          <AnalyticsSummary employeeId={employee.id} />
        </div>


      </div>


    </div>
  );
}

/* ---------------- Info Card ---------------- */
function Info({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2 bg-white/30 backdrop-blur-lg border border-white/30 rounded-xl p-3">
      {icon}
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

/* ---------------- Section Card ---------------- */
function SectionCard({ title }) {
  return (
    <div className="bg-white/30 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-6 h-64 flex items-center justify-center text-white/70 text-lg font-medium">
      {title}
    </div>
  );
}

/* ---------------- Edit Modal ---------------- */


/* ---------------- Input Component ---------------- */
function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
