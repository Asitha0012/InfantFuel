import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
    type: { type: String, enum: ["connection_request", "profile_added", "event_created", "vaccination_added","medication_added"], required: true },
    message: { type: String, required: true },
    link: { type: String }, // e.g. /network, /tracker, /profile/:id
    isRead: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who triggered
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);