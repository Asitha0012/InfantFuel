import mongoose from "mongoose";

const heightEntrySchema = mongoose.Schema({
  height: {
    type: Number,
    required: true,
    min: 0,
    max: 130 // cm, reasonable upper bound for 0-5 years
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

const heightSchema = mongoose.Schema({
  babyProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  entries: [heightEntrySchema]
}, { timestamps: true });

heightSchema.index({ babyProfile: 1 });
heightSchema.index({ "entries.dateRecorded": -1 });

const Height = mongoose.model("Height", heightSchema);
export default Height;


