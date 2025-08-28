import NutritionSolid from "../models/NutritionSolid.js";
import { createNotification } from "../utils/notify.js";

// Create solid food intake record (Parent only)
const createSolidFoodIntake = async (req, res) => {
  try {
    // Only parents (non-admin users) can create records
    if (req.user.isAdmin) {
      return res.status(403).json({ message: "Only parents can add solid food intake records" });
    }
    
    console.log("User attempting to create record:", req.user); // Debug log

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

    const solidFoodIntake = new NutritionSolid({
      childName,
      parentId: req.user._id, // Set the logged-in parent's ID
      foodType,
      foodName,
      amount,
      unit,
      mealTime,
      time: time || new Date(),
      notes,
      reaction
    });

    await solidFoodIntake.save();

    res.status(201).json(solidFoodIntake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get solid food intake records (Both parent and health provider)
const getSolidFoodRecords = async (req, res) => {
  try {
    const { childName, startDate, endDate, foodType, mealTime } = req.query;
    let query = {};

    // If user is parent, only show their records
    if (!req.user.isAdmin) {
      query.parentId = req.user._id;
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

// Get summary statistics (Both parent and health provider)
const getSolidFoodStats = async (req, res) => {
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
