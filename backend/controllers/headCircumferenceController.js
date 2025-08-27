import HeadCircumference from "../models/HeadCircumference.js";
import Connection from "../models/Connection.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const addHeadCircEntry = asyncHandler(async (req, res) => {
  const { headCircumference, dateRecorded, notes } = req.body;
  const { babyId } = req.params;
  const recordedBy = req.user._id;
  // Providers can add for connected babies; parents can add for their own baby profile
  if (req.user.isAdmin) {
    const connection = await Connection.findOne({
      $or: [
        { from: recordedBy, to: babyId, status: "accepted" },
        { from: babyId, to: recordedBy, status: "accepted" }
      ]
    });
    if (!connection) return res.status(403).json({ message: "No connection found with this baby profile" });
  } else {
    if (babyId !== recordedBy.toString()) {
      return res.status(403).json({ message: "Access denied. Parents can only add to their own profile." });
    }
  }
  if (!headCircumference || headCircumference < 20 || headCircumference > 60) {
    return res.status(400).json({ message: "Please provide a valid head circumference (20-60 cm)" });
  }
  let doc = await HeadCircumference.findOne({ babyProfile: babyId });
  if (!doc) doc = new HeadCircumference({ babyProfile: babyId, entries: [] });
  const newEntry = {
    headCircumference: parseFloat(headCircumference),
    dateRecorded: dateRecorded ? new Date(dateRecorded) : new Date(),
    recordedBy,
    notes: notes || "",
  };
  doc.entries.push(newEntry);
  doc.entries.sort((a, b) => new Date(a.dateRecorded) - new Date(b.dateRecorded));
  await doc.save();
  await doc.populate("entries.recordedBy", "fullName userType");
  res.status(201).json({ message: "Head circumference entry added", entry: doc.entries[doc.entries.length - 1] });
});

const getHeadCircHistory = asyncHandler(async (req, res) => {
  const { babyId } = req.params;
  const userId = req.user._id;
  let hasAccess = false;
  if (!req.user.isAdmin && babyId === userId.toString()) hasAccess = true;
  else if (req.user.isAdmin) {
    const connection = await Connection.findOne({
      $or: [
        { from: userId, to: babyId, status: "accepted" },
        { from: babyId, to: userId, status: "accepted" }
      ]
    });
    hasAccess = !!connection;
  }
  if (!hasAccess) return res.status(403).json({ message: "Access denied" });
  const doc = await HeadCircumference.findOne({ babyProfile: babyId })
    .populate("entries.recordedBy", "fullName userType")
    .populate("babyProfile", "fullName babyDetails");
  if (!doc) return res.json({ babyProfile: babyId, entries: [] });
  res.json(doc);
});

const getConnectedBabyProfiles = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied. Healthcare providers only." });
  const asFrom = await Connection.find({ from: userId, status: "accepted" })
    .populate("to", "fullName userType babyDetails profilePicture");
  const asTo = await Connection.find({ to: userId, status: "accepted" })
    .populate("from", "fullName userType babyDetails profilePicture");
  const babyProfiles = [
    ...asFrom.map(c => c.to).filter(u => u && !u.isAdmin),
    ...asTo.map(c => c.from).filter(u => u && !u.isAdmin)
  ];
  const unique = babyProfiles.filter((p, i, arr) => arr.findIndex(x => x._id.toString() === p._id.toString()) === i);
  res.json(unique);
});

const updateHeadCircEntry = asyncHandler(async (req, res) => {
  const { babyId, entryId } = req.params;
  const { headCircumference, dateRecorded, notes } = req.body;
  const userId = req.user._id;
  // Providers can update for connected babies; parents can update only their own entries on their profile
  if (req.user.isAdmin) {
    const connection = await Connection.findOne({
      $or: [
        { from: userId, to: babyId, status: "accepted" },
        { from: babyId, to: userId, status: "accepted" }
      ]
    });
    if (!connection) return res.status(403).json({ message: "No connection found with this baby profile" });
  } else {
    if (babyId !== userId.toString()) return res.status(403).json({ message: "Access denied" });
  }
  const doc = await HeadCircumference.findOne({ babyProfile: babyId });
  if (!doc) return res.status(404).json({ message: "Record not found" });
  const entry = doc.entries.id(entryId);
  if (!entry) return res.status(404).json({ message: "Entry not found" });
  if (entry.recordedBy.toString() !== userId.toString()) return res.status(403).json({ message: "You can only edit entries you recorded" });
  if (headCircumference) entry.headCircumference = parseFloat(headCircumference);
  if (dateRecorded) entry.dateRecorded = new Date(dateRecorded);
  if (notes !== undefined) entry.notes = notes;
  doc.entries.sort((a, b) => new Date(a.dateRecorded) - new Date(b.dateRecorded));
  await doc.save();
  await doc.populate("entries.recordedBy", "fullName userType");
  res.json({ message: "Head circumference entry updated", entry });
});

const deleteHeadCircEntry = asyncHandler(async (req, res) => {
  const { babyId, entryId } = req.params;
  const userId = req.user._id;
  // Providers can delete for connected babies; parents can delete only their own entries on their profile
  if (req.user.isAdmin) {
    const connection = await Connection.findOne({
      $or: [
        { from: userId, to: babyId, status: "accepted" },
        { from: babyId, to: userId, status: "accepted" }
      ]
    });
    if (!connection) return res.status(403).json({ message: "No connection found with this baby profile" });
  } else {
    if (babyId !== userId.toString()) return res.status(403).json({ message: "Access denied" });
  }
  const doc = await HeadCircumference.findOne({ babyProfile: babyId });
  if (!doc) return res.status(404).json({ message: "Record not found" });
  const entry = doc.entries.id(entryId);
  if (!entry) return res.status(404).json({ message: "Entry not found" });
  if (entry.recordedBy.toString() !== userId.toString()) return res.status(403).json({ message: "You can only delete entries you recorded" });
  doc.entries.pull(entryId);
  await doc.save();
  res.json({ message: "Head circumference entry deleted" });
});

export {
  addHeadCircEntry,
  getHeadCircHistory,
  getConnectedBabyProfiles,
  updateHeadCircEntry,
  deleteHeadCircEntry,
};


