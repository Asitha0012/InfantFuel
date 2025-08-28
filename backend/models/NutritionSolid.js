import mongoose from "mongoose";

const nutritionSolidSchema = new mongoose.Schema({
  childName: { 
    type: String, 
    required: true 
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  foodType: { 
    type: String, 
    required: true,
    enum: ['fruits', 'vegetables', 'grains', 'protein', 'dairy', 'other']
  },
  foodName: {
    type: String,
    required: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  unit: { 
    type: String, 
    required: true,
    enum: ['grams', 'tablespoons', 'pieces', 'servings']
  },
  mealTime: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
  time: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  notes: { 
    type: String 
  },
  reaction: {
    type: String,
    enum: ['good', 'neutral', 'allergic', 'dislike', null],
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const NutritionSolid = mongoose.model("NutritionSolid", nutritionSolidSchema);

export default NutritionSolid;
