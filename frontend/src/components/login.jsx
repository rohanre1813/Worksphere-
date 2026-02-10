import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../config";
export default function AnimatedLogin() {
  const [role, setRole] = useState("admin");

  return (
    <div className="relative z-20 flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="relative w-[360px] min-h-[420px] bg-zinc-950/90 border border-yellow-400/40 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.3)] overflow-hidden backdrop-blur-md"
      >
        {/* ROLE SWITCH */}
        <div className="flex">
          {["admin", "employee"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`w-1/2 py-3 font-bold uppercase tracking-wider transition-all
                ${role === r
                  ? "bg-yellow-400 text-black"
                  : "bg-zinc-900/70 text-yellow-400 hover:bg-zinc-800/70"
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* FORMS */}
        <div className="relative h-[340px]">
          <AnimatePresence mode="wait">
            {role === "admin" ? (
              <LoginForm
                key="admin"
                title="Admin Access"
                accent="yellow"
                role="admin"
              />
            ) : (
              <LoginForm
                key="employee"
                title="Employee Login"
                accent="cyan"
                role="employee"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function LoginForm({ title, accent, role }) {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); // email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const accentColor =
    accent === "yellow" ? "text-yellow-400" : "text-cyan-400";
  const borderColor =
    accent === "yellow" ? "border-yellow-400" : "border-cyan-400";
  const glow =
    accent === "yellow"
      ? "shadow-[0_0_25px_rgba(250,204,21,0.4)]"
      : "shadow-[0_0_25px_rgba(34,211,238,0.4)]";

  const handleLogin = async () => {
    if (!identifier || !password) {
      toast.error("Please fill all the details");

      return;
    }

    try {
      setLoading(true);

      const url =
        role === "admin"
          ? `${API_BASE_URL}/api/admin/login`
          : `${API_BASE_URL}/api/employee/login`;

      const payload = { email: identifier, password };

      const res = await axios.post(url, payload); // ✅ Used axios

      const data = res.data; // ✅ axios returns data in res.data
      if (role === "admin") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminId", data.admin.id); // ✅ Save Admin ID
        navigate("/admin-info");
      } else {
        // ✅ Save employeeId here so dashboard can show it
        localStorage.setItem(
          "employeeInfo",
          JSON.stringify({
            id: data.employee.id,
            employeeId: data.employee.employeeId,
            name: data.employee.name,
            email: data.employee.email,
            role: data.employee.role,
            admin: data.employee.admin, // ✅ Save Admin ID
          })
        );
        localStorage.setItem("employeeToken", data.token);
        navigate("/employee/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed"); // ✅ Handle axios error
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -120, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="absolute inset-0 p-6 flex flex-col justify-between"
    >
      <div>
        <motion.h2
          initial={{ letterSpacing: "0.1em" }}
          animate={{ letterSpacing: "0.25em" }}
          transition={{ duration: 1 }}
          className={`text-center mb-6 font-mono font-bold ${accentColor}`}
        >
          {title}
        </motion.h2>

        <div className="space-y-4">
          <AnimatedInput
            placeholder={role === "admin" ? "Admin Email" : "Employee Email"}
            borderColor={borderColor}
            accent={accent}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <AnimatedInput
            placeholder="Password"
            borderColor={borderColor}
            accent={accent}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className={`w-full py-3 mt-4 font-bold uppercase rounded-xl border ${borderColor} ${accentColor} ${glow}`}
            onClick={handleLogin}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </div>
      </div>

      {role === "admin" && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate(`/register`)}
            className={`text-sm underline ${accentColor} hover:text-white transition-colors`}
          >
            New? Register here
          </button>
        </div>
      )}
    </motion.div>
  );
}

function AnimatedInput({ placeholder, borderColor, accent, ...props }) {
  const glowColor =
    accent === "yellow" ? "rgba(250,204,21,0.5)" : "rgba(34,211,238,0.5)";

  return (
    <motion.input
      whileFocus={{
        scale: 1.03,
        boxShadow: `0 0 15px ${glowColor}`,
      }}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-black/80 text-white border ${borderColor} rounded-lg outline-none`}
      {...props}
    />
  );
}
