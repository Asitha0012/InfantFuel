import NutritionSolid from "../models/NutritionSolid.js";
import { createNotification } from "../utils/notify.js";
import mongoose from "mongoose";

// Create solid food intake record (Parent only)
const createSolidFoodIntake = async (req, res) => {
  try {
    // Only parents (non-admin users) can create records
    if (req.user.isAdmin) {
      return res.status(403).json({ message: "Only parents can add solid food intake records" });
    }
    
    const { 
      childName, 
      foodType, 
      foodName, 
      amount, 
      unit, 
      mealTime, 
      time, 
      notes,
      reaction 
    } = req.body;

    // Auto-map child name from the parent's profile (single-child assumption)
    const effectiveChildName = req.user?.babyDetails?.fullName || childName;
    if (!effectiveChildName) {
      return res.status(400).json({ message: "Child name missing. Please ensure baby profile is completed." });
    }

    // Basic validations and normalizations
    const amountNum = Number(amount);
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    const solidFoodIntake = new NutritionSolid({
      childName: effectiveChildName,
      parentId: req.user._id, // Set the logged-in parent's ID
      foodType,
      foodName,
      amount: amountNum,
      unit,
      mealTime,
      time: time ? new Date(time) : new Date(),
      notes,
      reaction: reaction || null,
    });

    await solidFoodIntake.save();

    res.status(201).json(solidFoodIntake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get solid food intake records (Both parent and healthcare provider)
// Providers can filter by parentId (must be a connected parent enforced at frontend; optional server-side checks can be added later)
const getSolidFoodRecords = async (req, res) => {
  try {
  const { childName, startDate, endDate, foodType, mealTime, parentId } = req.query;
  let query = {};

    // If user is parent, only show their records
    if (!req.user.isAdmin) {
      query.parentId = req.user._id;
    } else if (parentId) {
      // If healthcare provider, allow filtering by a specific parent
      // Ensure ObjectId type for aggregations/queries
      try {
        query.parentId = new mongoose.Types.ObjectId(parentId);
      } catch (e) {
        return res.status(400).json({ message: "Invalid parentId" });
      }
    }

    // Apply filters if provided
    if (childName) {
      query.childName = childName;
    }
    if (foodType) {
      query.foodType = foodType;
    }
    if (mealTime) {
      query.mealTime = mealTime;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      query.time = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

  const records = await NutritionSolid.find(query)
      .sort({ time: -1 })
      .populate('parentId', 'fullName email');

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update solid food intake record (Parent only)
const updateSolidFoodIntake = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the record
    const record = await NutritionSolid.findById(id);
    
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Check if the user is the parent who created the record
    if (record.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this record" });
    }

    // Update the record
    const updatedRecord = await NutritionSolid.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );

    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete solid food intake record (Parent only)
const deleteSolidFoodIntake = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the record
    const record = await NutritionSolid.findById(id);
    
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Check if the user is the parent who created the record
    if (record.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this record" });
    }

    await NutritionSolid.findByIdAndDelete(id);
    
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get summary statistics (Both parent and healthcare provider)
// Providers can filter by parentId
const getSolidFoodStats = async (req, res) => {
  try {
  const { childName, startDate, endDate, parentId } = req.query;
  let query = {};

    // If user is parent, only show their records
    if (!req.user.isAdmin) {
      query.parentId = req.user._id;
    } else if (parentId) {
      try {
        query.parentId = new mongoose.Types.ObjectId(parentId);
      } catch (e) {
        return res.status(400).json({ message: "Invalid parentId" });
      }
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

    // Get statistics by food type
    const foodTypeStats = await NutritionSolid.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$foodType",
          totalServings: { $sum: "$amount" },
          mealCount: { $sum: 1 },
          foodItems: { $addToSet: "$foodName" },
          reactions: {
            $push: {
              reaction: "$reaction",
              foodName: "$foodName"
            }
          }
        }
      }
    ]);

    // Get statistics by meal time
    const mealTimeStats = await NutritionSolid.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$mealTime",
          totalMeals: { $sum: 1 },
          averageAmount: { $avg: "$amount" },
          foodTypes: { $addToSet: "$foodType" }
        }
      }
    ]);

    res.json({
      byFoodType: foodTypeStats,
      byMealTime: mealTimeStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createSolidFoodIntake,
  getSolidFoodRecords,
  updateSolidFoodIntake,
  deleteSolidFoodIntake,
  getSolidFoodStats
};
