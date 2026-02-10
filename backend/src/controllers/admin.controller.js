import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* REGISTER */
export const registerAdmin = async (req, res) => {
  try {
    const {
      companyName,
      companyWebsite,
      adminName,
      email,
      password,
    } = req.body;

    if (!companyName || !companyWebsite || !adminName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      companyName,
      companyWebsite,
      adminName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        adminName: admin.adminName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* LOGIN */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Admin Login Attempt:", email);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        adminName: admin.adminName,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getAdminMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const updateAdminMe = async (req, res) => {
  try {
    const { adminName, companyWebsite, email } = req.body;

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 🔐 EMAIL UNIQUENESS CHECK
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(409).json({
          message: "Email already in use by another admin",
        });
      }
      admin.email = email;
    }

    if (adminName) admin.adminName = adminName;
    if (companyWebsite) admin.companyWebsite = companyWebsite;

    await admin.save();

    res.json({
      message: "Admin updated successfully",
      admin: {
        companyName: admin.companyName,
        companyWebsite: admin.companyWebsite,
        adminName: admin.adminName,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


