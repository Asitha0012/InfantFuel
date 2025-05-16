import express from "express";
import eventController from "../controllers/eventController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create event (healthcare provider only)
router.post("/", authenticate, eventController.createEvent);

// Get all events (all users)
router.get("/", authenticate, eventController.getEvents);

// Get single event by ID (all users)
router.get("/:id", authenticate, eventController.getEvent);

// Update event (only creator healthcare provider)
router.put("/:id", authenticate, eventController.updateEvent);

// Delete event (only creator healthcare provider)
router.delete("/:id", authenticate, eventController.deleteEvent);


export default router;