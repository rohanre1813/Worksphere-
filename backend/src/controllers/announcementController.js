import Announcement from "../models/Announcement.js";

// CREATE
export const createAnnouncement = async (req, res) => {
  try {
    const { message } = req.body;
    const adminId = req.user.id;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const newAnnouncement = await Announcement.create({
      message,
      admin: adminId,
    });

    // Real-time update
    const io = req.app.get("io");
    io.to(adminId).emit("announcement", newAnnouncement);

    res.status(201).json(newAnnouncement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET (Admin sees theirs, Employee sees their Admin's)
export const getAnnouncements = async (req, res) => {
  try {
    let adminId;

    if (req.user.role === "admin") {
      adminId = req.user.id;
    } else {
      // If employee, find their admin
      // req.user.id is employee ID
      // But verifyToken sets req.user to the payload. 
      // Admin payload has {id, role='admin'}. Employee payload has {id, role='employee'} (usually).
      // Assuming employeeAuthRoutes and standard auth structure.

      const emp = await import("../models/Employee.js").then(m => m.default.findById(req.user.id));
      if (!emp) return res.status(404).json({ message: "Employee not found" });
      adminId = emp.admin;
    }

    const announcements = await Announcement.find({ admin: adminId }).sort({
      createdAt: -1,
    });
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    // Only allow if belongs to this admin
    const announcement = await Announcement.findOneAndDelete({
      _id: id,
      admin: req.user.id,
    });

    if (!announcement) {
      return res.status(404).json({ message: "Not found or unauthorized" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
