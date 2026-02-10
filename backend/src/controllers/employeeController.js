import Employee from "../models/Employee.js";

// ---------------- ADD EMPLOYEE ----------------
export const addEmployee = async (req, res) => {
  try {
    const { employeeId, name, email, phoneNumber, role, password } = req.body;

    if (!employeeId || !name || !email || !phoneNumber || !role || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Email uniqueness (per admin)
    const existingEmail = await Employee.findOne({
      email,
      admin: req.user.id,
    });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Employee ID uniqueness (per admin)
    const existingEmpId = await Employee.findOne({
      employeeId,
      admin: req.user.id,
    });
    if (existingEmpId) {
      return res.status(409).json({ message: "Employee ID already exists" });
    }

    // Create employee (pre-save hook hashes password)
    const employee = await Employee.create({
      employeeId,
      name,
      email,
      phoneNumber,
      role,
      password, // plaintext, will be hashed by schema
      admin: req.user.id,
    });

    res.status(201).json({
      message: "Employee added",
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (err) {
    console.error("Add employee error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- GET EMPLOYEES ----------------
export const getEmployees = async (req, res) => {
  try {
    let adminId;

    if (req.user.role === "admin") {
      adminId = req.user.id;
    } else {
      // If employee, find which admin they belong to
      const me = await Employee.findById(req.user.id);
      if (!me) {
        return res.status(404).json({ message: "Employee not found" });
      }
      adminId = me.admin;
    }

    const employees = await Employee.find({
      admin: adminId,
    }).select("-password");

    res.json(employees);
  } catch (err) {
    console.error("Get employees error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- UPDATE EMPLOYEE ----------------
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, name, email, phoneNumber, role, password } = req.body;

    // Fetch employee with password included
    const employee = await Employee.findOne({
      _id: id,
      admin: req.user.id,
    }).select("+password");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Email uniqueness
    if (email && email !== employee.email) {
      const exists = await Employee.findOne({ email, admin: req.user.id });
      if (exists) return res.status(409).json({ message: "Email already exists" });
    }

    // Employee ID uniqueness
    if (employeeId && employeeId !== employee.employeeId) {
      const existsId = await Employee.findOne({ employeeId, admin: req.user.id });
      if (existsId) return res.status(409).json({ message: "Employee ID already exists" });
    }

    employee.employeeId = employeeId ?? employee.employeeId;
    employee.name = name ?? employee.name;
    employee.email = email ?? employee.email;
    employee.phoneNumber = phoneNumber ?? employee.phoneNumber;
    employee.role = role ?? employee.role;

    // Only set password if provided, pre-save hook will hash it
    if (password) {
      employee.password = password;
    }

    await employee.save();

    res.json({
      message: "Employee updated",
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (err) {
    console.error("Update employee error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- DELETE EMPLOYEE ----------------
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOneAndDelete({
      _id: id,
      admin: req.user.id,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error("Delete employee error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
