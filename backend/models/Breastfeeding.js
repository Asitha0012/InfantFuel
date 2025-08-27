import mongoose from "mongoose";

const breastfeedingSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  parentName: { type: String, required: true },
  childName: { type: String, required: true },
  feedingType: { type: String, required: true, enum: ["breastfeeding", "bottle", "mixed"] },
  duration: { type: Number }, // in minutes
  amount: { type: Number }, // in ml for bottle feeding
  date: { type: Date, required: true },
  notes: { type: String },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    position: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const Breastfeeding = mongoose.model("Breastfeeding", breastfeedingSchema);

export default Breastfeeding;