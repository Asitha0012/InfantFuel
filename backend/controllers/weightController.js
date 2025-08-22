import Weight from "../models/Weight.js";
import Connection from "../models/Connection.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Add a weight entry (healthcare providers only, for connected baby profiles)
const addWeightEntry = asyncHandler(async (req, res) => {
  const { weight, dateRecorded, notes } = req.body;
  const { babyId } = req.params;
  const recordedBy = req.user._id;

  // Only healthcare providers (admins) can add
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Healthcare providers only." });
  }

  // Check connection
  const connection = await Connection.findOne({
    $or: [
      { from: recordedBy, to: babyId, status: "accepted" },
      { from: babyId, to: recordedBy, status: "accepted" }
    ]
  });
  if (!connection) {
    return res.status(403).json({ message: "No connection found with this baby profile" });
  }

  // Validate weight
  if (!weight || weight <= 0 || weight > 50) {
    return res.status(400).json({ message: "Please provide a valid weight (0-50 kg)" });
  }

  // Find or create weight doc
  let weightDoc = await Weight.findOne({ babyProfile: babyId });
  if (!weightDoc) {
    weightDoc = new Weight({ babyProfile: babyId, entries: [] });
  }

  // Add entry
  const newEntry = {
    weight: parseFloat(weight),
    dateRecorded: dateRecorded ? new Date(dateRecorded) : new Date(),
    recordedBy,
    notes: notes || ""
  };
  weightDoc.entries.push(newEntry);
  weightDoc.entries.sort((a, b) => new Date(a.dateRecorded) - new Date(b.dateRecorded));
  await weightDoc.save();
  await weightDoc.populate("entries.recordedBy", "fullName userType");
  res.status(201).json({ message: "Weight entry added", weightEntry: weightDoc.entries[weightDoc.entries.length-1] });
});

// Get weight history (parents: only their own, providers: only connected babies)
const getWeightHistory = asyncHandler(async (req, res) => {
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
  const weightDoc = await Weight.findOne({ babyProfile: babyId })
    .populate("entries.recordedBy", "fullName userType")
    .populate("babyProfile", "fullName babyDetails");
  if (!weightDoc) {
    return res.json({ babyProfile: babyId, entries: [] });
  }
  res.json(weightDoc);
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

// Update a weight entry (healthcare providers only, only their own entries and only for connected baby profiles)
const updateWeightEntry = asyncHandler(async (req, res) => {
  const { babyId, entryId } = req.params;
  const { weight, dateRecorded, notes } = req.body;
  const userId = req.user._id;
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Healthcare providers only." });
  }
  // Check connection
  const connection = await Connection.findOne({
    $or: [
      { from: userId, to: babyId, status: "accepted" },
      { from: babyId, to: userId, status: "accepted" }
    ]
  });
  if (!connection) {
    return res.status(403).json({ message: "No connection found with this baby profile" });
  }
  const weightDoc = await Weight.findOne({ babyProfile: babyId });
  if (!weightDoc) {
    return res.status(404).json({ message: "Weight record not found" });
  }
  const entry = weightDoc.entries.id(entryId);
  if (!entry) {
    return res.status(404).json({ message: "Weight entry not found" });
  }
  if (entry.recordedBy.toString() !== userId.toString()) {
    return res.status(403).json({ message: "You can only edit entries you recorded" });
  }
  if (weight) entry.weight = parseFloat(weight);
  if (dateRecorded) entry.dateRecorded = new Date(dateRecorded);
  if (notes !== undefined) entry.notes = notes;
  weightDoc.entries.sort((a, b) => new Date(a.dateRecorded) - new Date(b.dateRecorded));
  await weightDoc.save();
  await weightDoc.populate("entries.recordedBy", "fullName userType");
  res.json({ message: "Weight entry updated", weightEntry: entry });
});

// Delete a weight entry (healthcare providers only, only their own entries and only for connected baby profiles)
const deleteWeightEntry = asyncHandler(async (req, res) => {
  const { babyId, entryId } = req.params;
  const userId = req.user._id;
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Healthcare providers only." });
  }
  // Check connection
  const connection = await Connection.findOne({
    $or: [
      { from: userId, to: babyId, status: "accepted" },
      { from: babyId, to: userId, status: "accepted" }
    ]
  });
  if (!connection) {
    return res.status(403).json({ message: "No connection found with this baby profile" });
  }
  const weightDoc = await Weight.findOne({ babyProfile: babyId });
  if (!weightDoc) {
    return res.status(404).json({ message: "Weight record not found" });
  }
  const entry = weightDoc.entries.id(entryId);
  if (!entry) {
    return res.status(404).json({ message: "Weight entry not found" });
  }
  if (entry.recordedBy.toString() !== userId.toString()) {
    return res.status(403).json({ message: "You can only delete entries you recorded" });
  }
  weightDoc.entries.pull(entryId);
  await weightDoc.save();
  res.json({ message: "Weight entry deleted" });
});

export {
  addWeightEntry,
  getWeightHistory,
  getConnectedBabyProfiles,
  updateWeightEntry,
  deleteWeightEntry
};
