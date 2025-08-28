import express from "express";
import nutritionSolidController from "../controllers/nutritionSolidController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Routes for solid food intake tracking
router.post("/", nutritionSolidController.createSolidFoodIntake);
router.get("/", nutritionSolidController.getSolidFoodRecords);
router.put("/:id", nutritionSolidController.updateSolidFoodIntake);
router.delete("/:id", nutritionSolidController.deleteSolidFoodIntake);
router.get("/stats", nutritionSolidController.getSolidFoodStats);

export default router;
