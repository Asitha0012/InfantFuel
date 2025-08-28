import Medication from "../models/Medication.js";
import Connection from "../models/Connection.js";
import { createNotification } from "../utils/notify.js";

// Create medication record (provider only)
const createMedication = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      parentId,
      parentName,
      childName,
      medicationName,
      dosage,
      frequency,
      date,
      notes
    } = req.body;

    // Verify provider is connected to parent
    const connection = await Connection.findOne({
      from: req.user._id,
      to: parentId,
      status: "accepted"
    });

    if (!connection) {
      return res.status(403).json({ message: "You are not connected to this parent" });
    }

    const medication = new Medication({
      parentId,
      parentName,
      childName,
      medicationName,
      dosage,
      frequency,
      date,
      notes,
      createdBy: {
        userId: req.user._id,
        name: req.user.fullName,
        position: req.user.position,
      },
    });

    await medication.save();

    // Notify the parent
    await createNotification({
      user: parentId,
      type: "medication_added",
      message: `${req.user.fullName} added a medication record for ${childName}`,
      link: "/medication-tracking",
      createdBy: req.user._id,
    });

    res.status(201).json(medication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get medications
// - Parents see their own records
// - Providers see records for all connected patients
const getMedications = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      const records = await Medication.find({ parentId: req.user._id }).sort({ date: -1 });
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

    // Get all medication records for connected parents
    const records = await Medication.find({ 
      parentId: { $in: connectedParentIds } 
    }).sort({ date: -1 });
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const medicationController = { createMedication, getMedications };
export default medicationController;
