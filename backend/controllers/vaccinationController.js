import Vaccination from "../models/vaccination.js";
import Connection from "../models/Connection.js";
import { createNotification } from "../utils/notify.js";

// Providers create vaccination records for children
const createVaccination = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { parentId, parentName, childName, vaccineName, date, notes } = req.body;

    // Verify this provider is connected to the parent
    const connection = await Connection.findOne({
      from: req.user._id,
      to: parentId,
      status: "accepted"
    });

    if (!connection) {
      return res.status(403).json({ message: "You are not connected to this parent" });
    }

    const vaccination = new Vaccination({
      parentId,
      parentName,
      childName,
      vaccineName,
      date,
      notes,
      createdBy: {
        userId: req.user._id,
        name: req.user.fullName,
        position: req.user.position,
      },
    });

    await vaccination.save();

    // Notify the parent
    await createNotification({
      user: parentId,
      type: "vaccination_added",
      message: `${req.user.fullName} added a vaccination record for ${childName}`,
      link: "/health-tracking",
      createdBy: req.user._id,
    });

    res.status(201).json(vaccination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vaccinations: parents see their records, providers see records for all connected patients
const getVaccinations = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      // Parent: see their own records
      const records = await Vaccination.find({ parentId: req.user._id }).sort({ date: -1 });
      return res.json(records);
    }

    // Provider: show records for all connected patients
    // First, get all accepted connections where this provider is involved
    const connections = await Connection.find({
      $or: [
        { from: req.user._id, status: "accepted" },
        { to: req.user._id, status: "accepted" }
      ]
    });

    // Extract parent IDs from connections
    const connectedParentIds = connections.map(conn => {
      // Return the other party's ID (the parent)
      return conn.from.toString() === req.user._id.toString() ? conn.to : conn.from;
    });

    // Get all vaccination records for connected parents
    const records = await Vaccination.find({ 
      parentId: { $in: connectedParentIds } 
    }).sort({ date: -1 });
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const vaccinationController = { createVaccination, getVaccinations };
export default vaccinationController;
