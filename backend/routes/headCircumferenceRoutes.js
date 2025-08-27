import express from "express";
import {
  addHeadCircEntry,
  getHeadCircHistory,
  getConnectedBabyProfiles,
  updateHeadCircEntry,
  deleteHeadCircEntry,
} from "../controllers/headCircumferenceController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/connected-profiles", authenticate, getConnectedBabyProfiles);

router.route("/:babyId")
  .get(authenticate, getHeadCircHistory)
  .post(authenticate, addHeadCircEntry);

router.route("/:babyId/:entryId")
  .put(authenticate, updateHeadCircEntry)
  .delete(authenticate, deleteHeadCircEntry);

export default router;


