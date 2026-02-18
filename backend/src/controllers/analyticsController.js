import ZoneLog from "../models/ZoneLog.js";

import Employee from "../models/Employee.js"; // Import Employee model

export const getEmployeeStats = async (req, res) => {
  try {
    const { id } = req.params; // Employee ID (Mongo ID)

    // Ensure only Admin or the Employee themselves can access
    const isSelf = req.user.id === id;
    const isAdmin = req.user.role === "admin";

    // Security Check
    if (!isAdmin && !isSelf) {
      // Check if they are co-workers (same admin)
      const requester = await Employee.findById(req.user.id).select("admin");
      const target = await Employee.findById(id).select("admin");

      if (
        !requester ||
        !target ||
        !requester.admin ||
        !target.admin ||
        requester.admin.toString() !== target.admin.toString()
      ) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    const stats = await ZoneLog.aggregate([
      {
        $match: {
          employeeId: new ZoneLog.base.Types.ObjectId(id),
          zone: { $nin: ["Out", "In"] }
        }
      },
      {
        $group: {
          _id: "$zone",
          totalMinutes: { $sum: "$durationMinutes" },
          visitCount: { $sum: 1 }
        }
      },
      { $sort: { totalMinutes: -1 } }
    ]);

    res.json(stats);
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getOfficeStats = async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized. Admin access required." });
    }

    const stats = await ZoneLog.aggregate([
      {
        $match: {
          adminId: new ZoneLog.base.Types.ObjectId(req.user.id), // 🔥 Scope to this Admin
          exitTime: { $ne: null },
          zone: { $nin: ["Out", "In"] }
        }
      },
      {
        $group: {
          _id: "$zone", // Zone Name
          totalMinutes: { $sum: "$durationMinutes" },
          visitCount: { $sum: 1 }
        }
      },
      { $sort: { totalMinutes: -1 } }
    ]);

    res.json(stats);
  } catch (err) {
    console.error("Office Analytics Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteOfficeStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized." });
    }

    // Delete ONLY this admin's logs
    await ZoneLog.deleteMany({ adminId: req.user.id });

    res.json({ message: "Analytics data cleared successfully." });
  } catch (err) {
    console.error("Delete Analytics Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
