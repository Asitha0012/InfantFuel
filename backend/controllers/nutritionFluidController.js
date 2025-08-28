import NutritionFluid from "../models/NutritionFluid.js";
import { createNotification } from "../utils/notify.js";

// Create fluid intake record (Parent only)
const createFluidIntake = async (req, res) => {
  try {
    // Debug logs
    console.log("========================");
    console.log("Creating Fluid Intake Record");
    console.log("User:", req.user);
    console.log("Request body:", req.body);
    console.log("========================");

    // Only parents can create records
    if (req.user.isAdmin) {
      console.log("Rejected: User is admin");
      return res.status(403).json({ message: "Only parents can add fluid intake records" });
    }

    const { childName, fluidType, amount, unit, time, notes } = req.body;

    const fluidIntake = new NutritionFluid({
      childName,
      parentId: req.user._id, // Set the logged-in parent's ID
      fluidType,
      amount,
      unit,
      time: time || new Date(),
      notes
    });

    await fluidIntake.save();

    res.status(201).json(fluidIntake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get fluid intake records (Both parent and health provider)
const getFluidIntakeRecords = async (req, res) => {
  try {
    const { childName, startDate, endDate } = req.query;
    let query = {};

    // If user is parent, only show their records
    if (!req.user.isAdmin) {
      query.parentId = req.user._id;
    }

    // If health provider and childName is provided, filter by childName
    if (childName) {
      query.childName = childName;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      query.time = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await NutritionFluid.find(query)
      .sort({ time: -1 })
      .populate('parentId', 'fullName email');

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update fluid intake record (Parent only)
const updateFluidIntake = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the record
    const record = await NutritionFluid.findById(id);
    
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Check if the user is the parent who created the record
    if (record.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this record" });
    }

    // Update the record
    const updatedRecord = await NutritionFluid.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );

    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete fluid intake record (Parent only)
const deleteFluidIntake = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the record
    const record = await NutritionFluid.findById(id);
    
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Check if the user is the parent who created the record
    if (record.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this record" });
    }

    await NutritionFluid.findByIdAndDelete(id);
    
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get summary statistics (Both parent and health provider)
const getFluidIntakeStats = async (req, res) => {
  try {
    const { childName, startDate, endDate } = req.query;
    let query = {};

    // If user is parent, only show their records
    if (!req.user.isAdmin) {
      query.parentId = req.user._id;
    }

    if (childName) {
      query.childName = childName;
    }

    if (startDate && endDate) {
      query.time = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await NutritionFluid.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$fluidType",
          totalAmount: { $sum: "$amount" },
          averageAmount: { $avg: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createFluidIntake,
  getFluidIntakeRecords,
  updateFluidIntake,
  deleteFluidIntake,
  getFluidIntakeStats
};
