import express from "express";
import medicationController from "../controllers/medicationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

// POST /api/v1/medications  → provider creates record
router.post("/", medicationController.createMedication);

// GET /api/v1/medications  → fetch records (parent or provider)
router.get("/", medicationController.getMedications);

export default router;
