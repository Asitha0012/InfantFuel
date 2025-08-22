import express from "express";
import {
  addWeightEntry,
  getWeightHistory,
  getConnectedBabyProfiles,
  updateWeightEntry,
  deleteWeightEntry
} from "../controllers/weightController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get connected baby profiles for healthcare provider
router.get("/connected-profiles", authenticate, getConnectedBabyProfiles);

// Weight history routes
router.route("/:babyId")
  .get(authenticate, getWeightHistory)
  .post(authenticate, addWeightEntry);

// Individual weight entry routes
router.route("/:babyId/:entryId")
  .put(authenticate, updateWeightEntry)
  .delete(authenticate, deleteWeightEntry);

export default router;
