import mongoose from "mongoose";

const vaccinationSchema = new mongoose.Schema({
  babyName: { type: String, required: true },
  vaccination: { type: String, required: true },
  date: { type: Date, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Vaccination", vaccinationSchema);
