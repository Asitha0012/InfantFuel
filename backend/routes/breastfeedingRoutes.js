import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  addBreastfeedingEntry,
  getBreastfeedingHistory,
  getConnectedBabyProfiles,
  updateBreastfeedingEntry,
  deleteBreastfeedingEntry
} from "../controllers/breastfeedingController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get connected baby profiles (for healthcare providers' sidebar)
router.get("/connected-profiles", getConnectedBabyProfiles);

// Get breastfeeding history for a specific baby
router.get("/:babyId", getBreastfeedingHistory);

// Add a new breastfeeding entry
router.post("/:babyId", addBreastfeedingEntry);

// Update a breastfeeding entry
router.put("/:babyId/:entryId", updateBreastfeedingEntry);

// Delete a breastfeeding entry
router.delete("/:babyId/:entryId", deleteBreastfeedingEntry);

export default router;
