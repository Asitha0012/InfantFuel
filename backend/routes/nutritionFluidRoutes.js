import express from "express";
import nutritionFluidController from "../controllers/nutritionFluidController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Routes for fluid intake tracking
router.post("/", nutritionFluidController.createFluidIntake);
router.get("/", nutritionFluidController.getFluidIntakeRecords);
router.put("/:id", nutritionFluidController.updateFluidIntake);
router.delete("/:id", nutritionFluidController.deleteFluidIntake);
router.get("/stats", nutritionFluidController.getFluidIntakeStats);

export default router;
