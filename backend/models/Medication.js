import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parentName: { type: String, required: true },
    childName: { type: String, required: true },
    medicationName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    date: { type: Date, required: true },
    notes: { type: String },
    createdBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      position: { type: String },
    },
  },
  { timestamps: true }
);

const Medication = mongoose.model("Medication", medicationSchema);
export default Medication;
