import express from "express";
import {
  addEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Admin only routes
router.get("/", authMiddleware, getEmployees);          // Get all employees
router.post("/", authMiddleware, addEmployee);         // Add employee
router.put("/:id", authMiddleware, updateEmployee);    // Update employee
router.delete("/:id", authMiddleware, deleteEmployee); // Delete employee

export default router;
