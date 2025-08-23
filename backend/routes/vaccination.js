import express from "express";
import {
  addVaccinationEntry,
  getVaccinationHistory,
  updateVaccinationEntry,
  deleteVaccinationEntry
} from "../controllers/vaccinationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate); // All routes require authentication

// Parents & Providers: View history
router.get("/", getVaccinationHistory);

// Providers only: Add / Edit / Delete
router.post("/", addVaccinationEntry);
router.put("/:id", updateVaccinationEntry);
router.delete("/:id", deleteVaccinationEntry);

export default router;
