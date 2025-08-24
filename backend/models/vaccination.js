import mongoose from "mongoose";

const vaccinationSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  parentName: { type: String, required: true },
  childName: { type: String, required: true },
  vaccineName: { type: String, required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    position: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const Vaccination = mongoose.model("Vaccination", vaccinationSchema);

export default Vaccination;
