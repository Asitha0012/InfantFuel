import Breastfeeding from "../models/Breastfeeding.js";
import Connection from "../models/Connection.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Add a breastfeeding entry (parents: their own babies, providers: connected babies)
const addBreastfeedingEntry = asyncHandler(async (req, res) => {
  const { duration, side, dateRecorded, notes } = req.body;
  const { babyId } = req.params;
  const recordedBy = req.user._id;

  // Check if user has access
  let hasAccess = false;
  if (!req.user.isAdmin && babyId === recordedBy.toString()) {
    // Parents can add entries for their own babies
    hasAccess = true;
  } else if (req.user.isAdmin) {
    // Healthcare providers can add for connected babies
    const connection = await Connection.findOne({
      $or: [
        { from: recordedBy, to: babyId, status: "accepted" },
        { from: babyId, to: recordedBy, status: "accepted" }
      ]
    });
    hasAccess = !!connection;
  }

  if (!hasAccess) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Validate duration
  if (!duration || duration < 1 || duration > 60) {
    return res.status(400).json({ message: "Please provide a valid duration (1-60 minutes)" });
  }

  // Validate side
  if (!side || !["left", "right", "both"].includes(side)) {
    return res.status(400).json({ message: "Please provide a valid side (left, right, or both)" });
  }

  // Find or create breastfeeding doc
  let breastfeedingDoc = await Breastfeeding.findOne({ babyProfile: babyId });
  if (!breastfeedingDoc) {
    breastfeedingDoc = new Breastfeeding({ babyProfile: babyId, entries: [] });
  }

  // Add entry
  const newEntry = {
    duration: parseInt(duration),
    side,
    dateRecorded: dateRecorded ? new Date(dateRecorded) : new Date(),
    recordedBy,
    notes: notes || ""
  };
  breastfeedingDoc.entries.push(newEntry);
  breastfeedingDoc.entries.sort((a, b) => new Date(a.dateRecorded) - new Date(b.dateRecorded));
  await breastfeedingDoc.save();
  await breastfeedingDoc.populate("entries.recordedBy", "fullName userType");
  res.status(201).json({ message: "Breastfeeding entry added", breastfeedingEntry: breastfeedingDoc.entries[breastfeedingDoc.entries.length-1] });
});

// Get breastfeeding history (parents: only their own, providers: only connected babies)
const getBreastfeedingHistory = asyncHandler(async (req, res) => {
  const { babyId } = req.params;
  const userId = req.user._id;
  let hasAccess = false;
  if (!req.user.isAdmin && babyId === userId.toString()) {
    // Parents can only access their own data
    hasAccess = true;
  } else if (req.user.isAdmin) {
    // Healthcare providers can access connected babies
    const connection = await Connection.findOne({
      $or: [
        { from: userId, to: babyId, status: "accepted" },
        { from: babyId, to: userId, status: "accepted" }
      ]
    });
    hasAccess = !!connection;
  }
  if (!hasAccess) {
    return res.status(403).json({ message: "Access denied" });
  }
  const breastfeedingDoc = await Breastfeeding.findOne({ babyProfile: babyId })
    .populate("entries.recordedBy", "fullName userType")
    .populate("babyProfile", "fullName babyDetails");
  if (!breastfeedingDoc) {
    return res.json({ babyProfile: babyId, entries: [] });
  }
  res.json(breastfeedingDoc);
});

// Get connected baby profiles (for healthcare providers' sidebar)
const getConnectedBabyProfiles = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Healthcare providers only." });
  }
  const asFrom = await Connection.find({ from: userId, status: "accepted" })
    .populate("to", "fullName userType babyDetails profilePicture");
  const asTo = await Connection.find({ to: userId, status: "accepted" })
    .populate("from", "fullName userType babyDetails profilePicture");
  const babyProfiles = [
    ...asFrom.map(conn => conn.to).filter(u => u && !u.isAdmin),
    ...asTo.map(conn => conn.from).filter(u => u && !u.isAdmin)
  ];
  // Remove duplicates
  const uniqueProfiles = babyProfiles.filter((profile, idx, arr) =>
    arr.findIndex(p => p._id.toString() === profile._id.toString()) === idx
  );
  res.json(uniqueProfiles);
});

// Update a breastfeeding entry (parents: their own entries, providers: their own entries for connected babies)
const updateBreastfeedingEntry = asyncHandler(async (req, res) => {
  const { babyId, entryId } = req.params;
  const { duration, side, dateRecorded, notes } = req.body;
  const userId = req.user._id;

  // Check if user has access to this baby
  let hasAccess = false;
  if (!req.user.isAdmin && babyId === userId.toString()) {
    // Parents can edit their own baby's entries
    hasAccess = true;
  } else if (req.user.isAdmin) {
    // Healthcare providers can edit for connected babies
    const connection = await Connection.findOne({
      $or: [
        { from: userId, to: babyId, status: "accepted" },
        { from: babyId, to: userId, status: "accepted" }
      ]
    });
    hasAccess = !!connection;
  }

  if (!hasAccess) {
    return res.status(403).json({ message: "Access denied" });
  }

  const breastfeedingDoc = await Breastfeeding.findOne({ babyProfile: babyId });
  if (!breastfeedingDoc) {
    return res.status(404).json({ message: "Breastfeeding record not found" });
  }
  const entry = breastfeedingDoc.entries.id(entryId);
  if (!entry) {
    return res.status(404).json({ message: "Breastfeeding entry not found" });
  }

  // Check if user can edit this entry
  if (entry.recordedBy.toString() !== userId.toString()) {
    return res.status(403).json({ message: "You can only edit entries you recorded" });
  }

  if (duration) {
    if (duration < 1 || duration > 60) {
      return res.status(400).json({ message: "Please provide a valid duration (1-60 minutes)" });
    }
    entry.duration = parseInt(duration);
  }
  if (side) {
    if (!["left", "right", "both"].includes(side)) {
      return res.status(400).json({ message: "Please provide a valid side (left, right, or both)" });
    }
    entry.side = side;
  }
  if (dateRecorded) entry.dateRecorded = new Date(dateRecorded);
  if (notes !== undefined) entry.notes = notes;

  breastfeedingDoc.entries.sort((a, b) => new Date(a.dateRecorded) - new Date(b.dateRecorded));
  await breastfeedingDoc.save();
  await breastfeedingDoc.populate("entries.recordedBy", "fullName userType");
  res.json({ message: "Breastfeeding entry updated", breastfeedingEntry: entry });
});

// Delete a breastfeeding entry (parents: their own entries, providers: their own entries for connected babies)
const deleteBreastfeedingEntry = asyncHandler(async (req, res) => {
  const { babyId, entryId } = req.params;
  const userId = req.user._id;

  // Check if user has access to this baby
  let hasAccess = false;
  if (!req.user.isAdmin && babyId === userId.toString()) {
    // Parents can delete their own baby's entries
    hasAccess = true;
  } else if (req.user.isAdmin) {
    // Healthcare providers can delete for connected babies
    const connection = await Connection.findOne({
      $or: [
        { from: userId, to: babyId, status: "accepted" },
        { from: babyId, to: userId, status: "accepted" }
      ]
    });
    hasAccess = !!connection;
  }

  if (!hasAccess) {
    return res.status(403).json({ message: "Access denied" });
  }

  const breastfeedingDoc = await Breastfeeding.findOne({ babyProfile: babyId });
  if (!breastfeedingDoc) {
    return res.status(404).json({ message: "Breastfeeding record not found" });
  }
  const entry = breastfeedingDoc.entries.id(entryId);
  if (!entry) {
    return res.status(404).json({ message: "Breastfeeding entry not found" });
  }

  // Check if user can delete this entry
  if (entry.recordedBy.toString() !== userId.toString()) {
    return res.status(403).json({ message: "You can only delete entries you recorded" });
  }

  breastfeedingDoc.entries.pull(entryId);
  await breastfeedingDoc.save();
  res.json({ message: "Breastfeeding entry deleted" });
});

export {
  addBreastfeedingEntry,
  getBreastfeedingHistory,
  getConnectedBabyProfiles,
  updateBreastfeedingEntry,
  deleteBreastfeedingEntry
};
