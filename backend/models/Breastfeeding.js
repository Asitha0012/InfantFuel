import mongoose from "mongoose";

const breastfeedingEntrySchema = mongoose.Schema({
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 60 // Maximum 60 minutes per session
  },
  side: {
    type: String,
    enum: ["left", "right", "both"],
    required: true
  },
  dateRecorded: {
    type: Date,
    required: true,
    default: Date.now
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

const breastfeedingSchema = mongoose.Schema({
  babyProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  entries: [breastfeedingEntrySchema]
}, { timestamps: true });

// Index for efficient queries
breastfeedingSchema.index({ babyProfile: 1 });
breastfeedingSchema.index({ "entries.dateRecorded": -1 });

const Breastfeeding = mongoose.model("Breastfeeding", breastfeedingSchema);
export default Breastfeeding;