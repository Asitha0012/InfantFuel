import express from "express";
import vaccinationController from "../controllers/vaccinationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", vaccinationController.createVaccination);
router.get("/", vaccinationController.getVaccinations);

export default router;
