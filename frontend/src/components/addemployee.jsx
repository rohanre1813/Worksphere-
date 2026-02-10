import { useState, useEffect } from "react";
import { Eye, EyeOff, Plus, Pencil, X, Trash2, Search } from "lucide-react";
import { toast } from 'react-hot-toast'
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function EmployeeList() {
  const [showPassword, setShowPassword] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEmployee, setEditEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    email: "",
    phoneNumber: "",
    role: "",
    password: "",
  });

  const token = localStorage.getItem("token");

  /* ---------------- FETCH EMPLOYEES ---------------- */
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) setEmployees(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchEmployees();
  }, [token]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddEmployee = async () => {
    if (Object.values(form).some((v) => !v)) {
      alert("All fields required");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/employees`, form, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setEmployees((prev) => [...prev, res.data.employee]);
      setForm({ employeeId: "", name: "", email: "", phoneNumber: "", role: "", password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error")
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this employee?")) return;

    axios.delete(`${API_BASE_URL}/api/employees/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setEmployees((e) => e.filter((x) => x._id !== id));
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to delete");
      });
  };

  /* ---------------- SAVE EDIT ---------------- */
  const handleSaveEdit = async () => {
    const { _id, password, ...rest } = editEmployee;

    const payload = {
      ...rest,
      ...(password ? { password } : {}), // ✅ only update password if changed
    };

    try {
      const res = await axios.put(`${API_BASE_URL}/api/employees/${_id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setEmployees((e) =>
        e.map((emp) => (emp._id === _id ? res.data.employee : emp))
      );
      setEditEmployee(null);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen w-full overflow-x-hidden p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ADD EMPLOYEE */}
        <div className="bg-white/40 backdrop-blur-lg border rounded-2xl p-4 sm:p-6 -ml-2">
          <h1 className="text-xl font-semibold mb-4">Add Employee</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleChange} />
            <Input label="Name" name="name" value={form.name} onChange={handleChange} />
            <Input label="Email" name="email" value={form.email} onChange={handleChange} />
            <Input label="Phone" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            <Input label="Role" name="role" value={form.role} onChange={handleChange} />

            <div className="relative">
              <label className="text-sm">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full mt-1 border rounded-xl px-4 py-2 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleAddEmployee}
            className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-xl"
          >
            <Plus size={16} className="inline mr-1" /> Add Employee
          </button>
        </div>

        {/* EMPLOYEE LIST */}
        <div className="bg-white/30 backdrop-blur-lg border rounded-2xl p-2 sm:p-6 -ml-2">

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-lg font-semibold w-full sm:w-auto text-center sm:text-left">Employee List</h2>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : employees.length === 0 ? (
            <p>No employees found.</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Password</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees
                    .filter((emp) =>
                      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((emp) => (
                      <tr key={emp._id} className="border-b">
                        <td>{emp.employeeId}</td>
                        <td>{emp.name}</td>
                        <td className="break-all">{emp.email}</td>
                        <td>{emp.role}</td>
                        <td>••••••</td>
                        <td className="flex gap-2">
                          <button
                            onClick={() =>
                              setEditEmployee({ ...emp, password: "" })
                            }
                            className="bg-yellow-400 p-1 rounded"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(emp._id)}
                            className="bg-red-500 p-1 rounded text-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* EDIT MODAL */}
        {editEmployee && (
          <EditModal
            employee={editEmployee}
            setEmployee={setEditEmployee}
            onSave={handleSaveEdit}
            onClose={() => setEditEmployee(null)}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm capitalize">{label}</label>
      <input
        {...props}
        className="w-full mt-1 border rounded-xl px-4 py-2 bg-transparent"
      />
    </div>
  );
}

function EditModal({ employee, setEmployee, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
      <div className="bg-white/40 backdrop-blur-xl border rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit Employee</h2>

        <div className="space-y-3">
          {["employeeId", "name", "email", "phoneNumber", "role", "password"].map((field) => (
            <Input
              key={field}
              label={field}
              name={field}
              value={employee[field] || ""}
              onChange={(e) =>
                setEmployee({ ...employee, [field]: e.target.value })
              }
            />
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="border px-4 py-2 rounded-xl">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
