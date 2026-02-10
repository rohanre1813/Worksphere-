import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

export default function RegisterPage() {

  return (
    <div className="relative z-20 flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="relative w-[90%] max-w-[360px]
        min-h-[90vh] md:min-h-[600px] bg-zinc-950/90 border border-yellow-400/40
        rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.3)]
        overflow-hidden backdrop-blur-md"
      >
        {/* Role Switch */}
        <div className="flex">
          {
            <button
              key="admin"
              className={`w-100 py-3 font-bold uppercase tracking-wider transition-all bg-yellow-400 text-black `}>
              Admin
            </button>
          }
        </div>

        <div className="relative h-[420px]">
          <AnimatePresence mode="wait">
            (
            <AdminRegisterForm key="admin" />
            )
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= ADMIN REGISTER ================= */

function AdminRegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    companyWebsite: "",
    adminName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      await axios.post(`${API_BASE}/api/admin/register`, {
        companyName: form.companyName,
        companyWebsite: form.companyWebsite,
        adminName: form.adminName,
        email: form.email,
        password: form.password,
      });

      navigate("/admin-info");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -120, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 p-6 flex flex-col justify-between"
    >
      <div>
        <h2 className="text-center mb-4 font-mono font-bold text-yellow-400 tracking-widest">
          ADMIN REGISTER
        </h2>

        <div className="space-y-3">
          <Input placeholder="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          <Input placeholder="Company Website" value={form.companyWebsite} onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })} />
          <Input placeholder="Admin Name" value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
          <Input type="email" placeholder="Admin Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 mt-2 font-bold uppercase rounded-xl
            border border-yellow-400 text-yellow-400
            shadow-[0_0_25px_rgba(250,204,21,0.4)]"
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate("/")}
          className="text-sm underline text-yellow-400"
        >
          Existing? Login here
        </button>
      </div>
    </motion.div>
  );
}

/* ================= EMPLOYEE (PLACEHOLDER) ================= */

function EmployeeRegisterForm() {
  return (
    <motion.div className="absolute inset-0 p-6 flex items-center justify-center text-cyan-400">
      Employee registration coming soon
    </motion.div>
  );
}

/* ================= INPUT ================= */

function Input({ type = "text", placeholder, value, onChange }) {
  return (
    <motion.input
      whileFocus={{
        scale: 1.03,
        boxShadow: "0 0 15px rgba(250,204,21,0.5)",
      }}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-black/80 text-white
      border border-yellow-400 rounded-lg outline-none"
    />
  );
}
