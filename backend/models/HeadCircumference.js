import mongoose from "mongoose";

const headCircEntrySchema = mongoose.Schema({
  headCircumference: {
    type: Number,
    required: true,
    min: 20, // cm
    max: 60,
  },
  dateRecorded: {
    type: Date,
    required: true,
    default: Date.now,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
}, { timestamps: true });

const headCircSchema = mongoose.Schema({
  babyProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  entries: [headCircEntrySchema],
}, { timestamps: true });

headCircSchema.index({ babyProfile: 1 });
headCircSchema.index({ "entries.dateRecorded": -1 });

const HeadCircumference = mongoose.model("HeadCircumference", headCircSchema);
export default HeadCircumference;


