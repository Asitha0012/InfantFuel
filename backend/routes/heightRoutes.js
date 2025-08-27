import express from "express";
import {
  addHeightEntry,
  getHeightHistory,
  getConnectedBabyProfiles,
  updateHeightEntry,
  deleteHeightEntry
} from "../controllers/heightController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/connected-profiles", authenticate, getConnectedBabyProfiles);

router.route("/:babyId")
  .get(authenticate, getHeightHistory)
  .post(authenticate, addHeightEntry);

router.route("/:babyId/:entryId")
  .put(authenticate, updateHeightEntry)
  .delete(authenticate, deleteHeightEntry);

export default router;


