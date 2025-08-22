import mongoose from "mongoose";

const weightEntrySchema = mongoose.Schema({
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 50 // Reasonable max weight for infants/children in kg
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

const weightSchema = mongoose.Schema({
  babyProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  entries: [weightEntrySchema]
}, { timestamps: true });

// Index for efficient queries
weightSchema.index({ babyProfile: 1 });
weightSchema.index({ "entries.dateRecorded": -1 });

const Weight = mongoose.model("Weight", weightSchema);
export default Weight;
