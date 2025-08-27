import Height from "../models/Height.js";
import Connection from "../models/Connection.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Add a height entry (healthcare providers only, for connected baby profiles)
const addHeightEntry = asyncHandler(async (req, res) => {
  const { height, dateRecorded, notes } = req.body;
  const { babyId } = req.params;
  const recordedBy = req.user._id;

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Healthcare providers only." });
  }

  const connection = await Connection.findOne({
    $or: [
      { from: recordedBy, to: babyId, status: "accepted" },
      { from: babyId, to: recordedBy, status: "accepted" }
    ]
  });
  if (!connection) {
    return res.status(403).json({ message: "No connection found with this baby profile" });
  }

  if (!height || height <= 0 || height > 130) {
    return res.status(400).json({ message: "Please provide a valid height (0-130 cm)" });
  }

  let heightDoc = await Height.findOne({ babyProfile: babyId });
  if (!heightDoc) {
    heightDoc = new Height({ babyProfile: babyId, entries: [] });
  }

  const newEntry = {
    height: parseFloat(height),
    dateRecorded: dateRecorded ? new Date(dateRecorded) : new Date(),
    recordedBy,
    notes: notes || ""
  };
  heightDoc.entries.push(newEntry);
  heightDoc.entries.sort((a, b) => new Date(a.dateRecorded) - new Date(b.dateRecorded));
  await heightDoc.save();
  await heightDoc.populate("entries.recordedBy", "fullName userType");
  res.status(201).json({ message: "Height entry added", heightEntry: heightDoc.entries[heightDoc.entries.length-1] });
});

// Get height history (parents: only their own, providers: only connected babies)
const getHeightHistory = asyncHandler(async (req, res) => {
  const { babyId } = req.params;
  const userId = req.user._id;
  let hasAccess = false;
  if (!req.user.isAdmin && babyId === userId.toString()) {
    hasAccess = true;
  } else if (req.user.isAdmin) {
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
  const heightDoc = await Height.findOne({ babyProfile: babyId })
    .populate("entries.recordedBy", "fullName userType")
    .populate("babyProfile", "fullName babyDetails");
  if (!heightDoc) {
    return res.json({ babyProfile: babyId, entries: [] });
  }
  res.json(heightDoc);
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
  const uniqueProfiles = babyProfiles.filter((profile, idx, arr) =>
    arr.findIndex(p => p._id.toString() === profile._id.toString()) === idx
  );
  res.json(uniqueProfiles);
});

// Update a height entry (providers only; only their own entries)
const updateHeightEntry = asyncHandler(async (req, res) => {
  const { babyId, entryId } = req.params;
  const { height, dateRecorded, notes } = req.body;
  const userId = req.user._id;
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Healthcare providers only." });
  }
  const connection = await Connection.findOne({
    $or: [
      { from: userId, to: babyId, status: "accepted" },
      { from: babyId, to: userId, status: "accepted" }
    ]
  });
  if (!connection) {
    return res.status(403).json({ message: "No connection found with this baby profile" });
  }
  const heightDoc = await Height.findOne({ babyProfile: babyId });
  if (!heightDoc) {
    return res.status(404).json({ message: "Height record not found" });
  }
  const entry = heightDoc.entries.id(entryId);
  if (!entry) {
    return res.status(404).json({ message: "Height entry not found" });
  }
  if (entry.recordedBy.toString() !== userId.toString()) {
    return res.status(403).json({ message: "You can only edit entries you recorded" });
  }
  if (height) entry.height = parseFloat(height);
  if (dateRecorded) entry.dateRecorded = new Date(dateRecorded);
  if (notes !== undefined) entry.notes = notes;
  heightDoc.entries.sort((a, b) => new Date(a.dateRecorded) - new Date(b.dateRecorded));
  await heightDoc.save();
  await heightDoc.populate("entries.recordedBy", "fullName userType");
  res.json({ message: "Height entry updated", heightEntry: entry });
});

// Delete a height entry (providers only; only their own entries)
const deleteHeightEntry = asyncHandler(async (req, res) => {
  const { babyId, entryId } = req.params;
  const userId = req.user._id;
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Healthcare providers only." });
  }
  const connection = await Connection.findOne({
    $or: [
      { from: userId, to: babyId, status: "accepted" },
      { from: babyId, to: userId, status: "accepted" }
    ]
  });
  if (!connection) {
    return res.status(403).json({ message: "No connection found with this baby profile" });
  }
  const heightDoc = await Height.findOne({ babyProfile: babyId });
  if (!heightDoc) {
    return res.status(404).json({ message: "Height record not found" });
  }
  const entry = heightDoc.entries.id(entryId);
  if (!entry) {
    return res.status(404).json({ message: "Height entry not found" });
  }
  if (entry.recordedBy.toString() !== userId.toString()) {
    return res.status(403).json({ message: "You can only delete entries you recorded" });
  }
  heightDoc.entries.pull(entryId);
  await heightDoc.save();
  res.json({ message: "Height entry deleted" });
});

export {
  addHeightEntry,
  getHeightHistory,
  getConnectedBabyProfiles,
  updateHeightEntry,
  deleteHeightEntry
};


