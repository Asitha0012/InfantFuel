import mongoose from "mongoose";

const nutritionFluidSchema = new mongoose.Schema({
  childName: { 
    type: String, 
    required: true 
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  fluidType: { 
    type: String, 
    required: true,
    enum: ['water', 'milk', 'formula', 'juice', 'other']
  },
  amount: { 
    type: Number, 
    required: true 
  },
  unit: { 
    type: String, 
    required: true,
    enum: ['ml', 'oz']
  },
  time: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  notes: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const NutritionFluid = mongoose.model("NutritionFluid", nutritionFluidSchema);

export default NutritionFluid;
