import authMiddleware from "../middleware/auth.js";
import { getAdminMe } from "../controllers/admin.controller.js";

import express from "express";
import {
  registerAdmin,
  loginAdmin,
  updateAdminMe,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/me", authMiddleware, getAdminMe);
router.put("/me", authMiddleware, updateAdminMe);

export default router;
