import express from "express";
import { employeeLogin, getMe } from "../controllers/employeeAuthController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/login", employeeLogin);
router.get("/me", authMiddleware, getMe);

export default router;
