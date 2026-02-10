import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // ✅ Fetch employee with password
    const employee = await Employee.findOne({ email }).select("+password");
    if (!employee) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Compare plaintext password with hashed password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      console.log("INPUT PASSWORD:", password);
      console.log("HASH FROM DB   :", employee.password);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: employee._id, role: "employee" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        admin: employee.admin, // ✅ Return Admin ID
      },
    });
  } catch (error) {
    console.error("Employee login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select(
      "employeeId name email role currentZone admin" // ✅ Select Admin ID
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

