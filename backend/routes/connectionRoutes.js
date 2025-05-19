import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  searchUsers,
  sendRequest,
  acceptRequest,
  addConnectionDirect,
  getIncomingRequests,
  getConnections,
  deleteRequest,
  deleteConnection,
} from "../controllers/connectionController.js";

const router = express.Router();

router.get("/search", authenticate, searchUsers);
router.post("/request", authenticate, sendRequest);
router.post("/accept", authenticate, acceptRequest);
router.post("/add-direct", authenticate, addConnectionDirect);
router.get("/incoming", authenticate, getIncomingRequests);
router.get("/", authenticate, getConnections);
router.delete("/delete", authenticate, deleteRequest);
router.delete("/delete-connection", authenticate, deleteConnection);

export default router;