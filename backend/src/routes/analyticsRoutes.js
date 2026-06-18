import express from "express";
import { getEmployeeStats, getOfficeStats, deleteOfficeStats, getEmployeeAttendance } from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/auth.js"; // Reuse existing middleware

const router = express.Router();

// Route: /api/analytics/employee/:id
// Accessible by: Admin (via token) or Employee (via token)
router.get("/employee/:id", authMiddleware, getEmployeeStats);

// Route: /api/analytics/attendance/:id
// Accessible by: Admin (via token) or Employee (via token)
router.get("/attendance/:id", authMiddleware, getEmployeeAttendance);

// Route: /api/analytics/office
// Accessible by: Admin only
router.get("/office", authMiddleware, getOfficeStats);
router.delete("/office", authMiddleware, deleteOfficeStats);

export default router;
