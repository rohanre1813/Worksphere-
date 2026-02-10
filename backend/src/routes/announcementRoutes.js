import express from "express";
import verifyToken from "../middleware/auth.js";
import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

// Apply middleware to all routes
router.use(verifyToken);

router.post("/", createAnnouncement);
router.get("/", getAnnouncements);
router.delete("/:id", deleteAnnouncement);

export default router;
