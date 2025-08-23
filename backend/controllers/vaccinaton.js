import Vaccination from "../models/vaccination.js";

// 📌 Get vaccination history (Parents + Providers can view)
export const getVaccinationHistory = async (req, res) => {
  try {
    const records = await Vaccination.find().sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Add new vaccination entry (Only providers)
export const addVaccinationEntry = async (req, res) => {
  if (req.user.userType !== "healthcareProvider") {
    return res.status(403).json({
      message: "Access denied. Only healthcare providers can add records.",
    });
  }

  const { babyName, vaccineName, dateAdministered, nextDueDate, notes } = req.body;

  if (!babyName || !vaccineName || !dateAdministered) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const newEntry = new Vaccination({
      babyName,
      vaccineName,
      dateAdministered,
      nextDueDate: nextDueDate || null,
      notes: notes || null,
      addedBy: req.user._id,
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📌 Update entry (Only providers)
export const updateVaccinationEntry = async (req, res) => {
  if (req.user.userType !== "healthcareProvider") {
    return res.status(403).json({
      message: "Access denied. Only healthcare providers can update records.",
    });
  }

  try {
    const updated = await Vaccination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Record not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📌 Delete entry (Only providers)
export const deleteVaccinationEntry = async (req, res) => {
  if (req.user.userType !== "healthcareProvider") {
    return res.status(403).json({
      message: "Access denied. Only healthcare providers can delete records.",
    });
  }

  try {
    const deleted = await Vaccination.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
