import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // sender or adder
  fromName: { type: String, required: true }, // name of sender/adder at the time
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },   // recipient
  toName: { type: String, required: true },   // name of recipient at the time
  status: { type: String, enum: ["pending", "accepted"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const Connection = mongoose.model("Connection", connectionSchema);
export default Connection;