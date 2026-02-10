import { Loader2, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import OfficeAnalytics from "./OfficeAnalytics";

const API = API_BASE_URL;

export default function AdminInfo() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    axios.get(`${API}/api/admin/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => setAdmin(res.data))
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        } else {
          console.error(err);
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black mt- -mt-28">
        <Loader2 className="w-20 h-20 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 text-black">
      <div className="max-w-3xl mx-auto bg-white/40 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-semibold">
            Admin Information
          </h1>
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <Pencil size={16} /> Edit
          </button>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Info label="Company Name" value={admin.companyName} />
          <Info label="Company Website" value={'https://' + admin.companyWebsite} link />
          <Info label="Admin Name" value={admin.adminName} />
          <Info label="Official Email" value={admin.email} />
          <Info
            label="Account Created"
            value={new Date(admin.createdAt).toLocaleString()}
          />
        </div>

        {/* Office Analytics */}
        <div className="mt-8">
          <OfficeAnalytics />
        </div>

        {isEditOpen && (
          <EditModal
            admin={admin}
            setAdmin={setAdmin}
            onClose={() => setIsEditOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Info({ label, value, link }) {
  return (
    <div>
      <p className="text-sm text-gray-900 mb-1">{label}</p>
      {link ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-black-600 underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="font-medium break-all">{value}</p>
      )}
    </div>
  );
}

function EditModal({ admin, setAdmin, onClose }) {
  const [form, setForm] = useState({
    adminName: admin.adminName,
    companyWebsite: admin.companyWebsite,
    email: admin.email,
  });

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.put("http://localhost:5000/api/admin/me", form, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res);

      setAdmin(res.data.admin);
      onClose();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("Email already exists. Use a different email.");
      } else {
        alert(err.response?.data?.message || "Update failed");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 mt-40">
      <div className="bg-white/40 backdrop-blur-xl  border border-white/80 rounded-2xl w-[90%] sm:max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-800 "
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          Edit Admin Information
        </h2>

        <div className="space-y-4">
          <Input
            label="Admin Name"
            value={form.adminName}
            onChange={(v) => setForm({ ...form, adminName: v })}
          />
          <Input
            label="Company Website"
            value={form.companyWebsite}
            onChange={(v) => setForm({ ...form, companyWebsite: v })}
          />
          <Input
            label="Official Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-black mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
