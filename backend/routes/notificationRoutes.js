import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getNotifications, markAllAsRead } from "../controllers/notificationController.js";
const router = express.Router();

router.get("/", authenticate, getNotifications);
router.post("/mark-all-read", authenticate, markAllAsRead);

export default router;