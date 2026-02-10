import Employee from "../models/Employee.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const loginEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const token = generateToken(employee._id);

    res.json({
      token,
      employee,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  const employee = await Employee.findById(req.user.id);
  res.json(employee);
};
