import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date },      // Not required
  place: { type: String },   // Not required
  details: { type: String }, // Not required
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    position: String,
  },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;