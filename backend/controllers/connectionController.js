import User from "../models/User.js";
import Connection from "../models/Connection.js";


// Search users (parents search providers by name/regNo, providers search babies/parents by name)
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    let users;
    if (req.user.isAdmin) {
      // Provider: search parents by parent name or baby name
      users = await User.find({
        isAdmin: false,
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { "babyDetails.fullName": { $regex: q, $options: "i" } },
        ],
      }).select("fullName babyDetails address contactNumber");
    } else {
      // Parent: search providers by name or professional registration number
      users = await User.find({
        isAdmin: true,
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { professionalRegistrationNumber: { $regex: q, $options: "i" } },
        ],
      }).select("fullName professionalRegistrationNumber contactNumber position district");
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Parent sends request to provider
const sendRequest = async (req, res) => {
  try {
    const { to } = req.body;
    if (req.user.isAdmin) {
      return res.status(403).json({ message: "Only parents can send requests" });
    }
    // Prevent duplicate requests
    const existing = await Connection.findOne({ from: req.user._id, to });
    if (existing) {
      return res.status(400).json({ message: "Request already sent or already connected" });
    }
    // Get names for from and to
    const fromUser = await User.findById(req.user._id);
    const toUser = await User.findById(to);
    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const connection = new Connection({
      from: req.user._id,
      fromName: fromUser.fullName,
      to,
      toName: toUser.fullName,
      status: "pending"
    });
    await connection.save();
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Provider accepts request
const acceptRequest = async (req, res) => {
  try {
    const { connectionId } = req.body;
    const connection = await Connection.findById(connectionId);
    if (!connection) return res.status(404).json({ message: "Request not found" });
    if (connection.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    connection.status = "accepted";
    await connection.save();
    res.json({ message: "Connection accepted", connection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Provider adds parent/baby directly (no pending)
const addConnectionDirect = async (req, res) => {
  try {
    const { to } = req.body;
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Only providers can add directly" });
    }
    // Prevent duplicate
    const existing = await Connection.findOne({ from: req.user._id, to });
    if (existing) {
      return res.status(400).json({ message: "Already connected" });
    }
    // Get names for from and to
    const fromUser = await User.findById(req.user._id);
    const toUser = await User.findById(to);
    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const connection = new Connection({
      from: req.user._id,
      fromName: fromUser.fullName,
      to,
      toName: toUser.fullName,
      status: "accepted"
    });
    await connection.save();
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Provider views incoming requests
const getIncomingRequests = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Only providers can view incoming requests" });
    }
    const requests = await Connection.find({ to: req.user._id, status: "pending" })
      .populate("from", "fullName district position address contactNumber babyDetails");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all connections for a user (accepted)
const getConnections = async (req, res) => {
  try {
    const asFrom = await Connection.find({ from: req.user._id, status: "accepted" })
      .populate(
        "to",
        "fullName district position address contactNumber babyDetails professionalRegistrationNumber isAdmin"
      );
    const asTo = await Connection.find({ to: req.user._id, status: "accepted" })
      .populate(
        "from",
        "fullName district position address contactNumber babyDetails professionalRegistrationNumber isAdmin"
      );
    res.json({ asFrom, asTo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Allow parent (sender) to cancel their own pending request
// Or provider (recipient) to reject incoming request
const deleteRequest = async (req, res) => {
  try {
    const { connectionId } = req.body;
    const connection = await Connection.findById(connectionId);
    if (!connection) return res.status(404).json({ message: "Request not found" });

    const isSender = connection.from.toString() === req.user._id.toString();
    const isRecipient = connection.to.toString() === req.user._id.toString() && req.user.isAdmin;

    if (!isSender && !isRecipient) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (connection.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be deleted" });
    }
    await connection.deleteOne();
    res.json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Healthcare provider deletes an existing connection (accepted)
const deleteConnection = async (req, res) => {
  try {
    const { connectionId } = req.body;
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Only healthcare providers can delete connections" });
    }
    const connection = await Connection.findById(connectionId);
    if (!connection) return res.status(404).json({ message: "Connection not found" });

    // Allow provider to delete if they are either the sender or recipient
    const isFrom = connection.from.toString() === req.user._id.toString();
    const isTo = connection.to.toString() === req.user._id.toString();

    if (!isFrom && !isTo) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (connection.status !== "accepted") {
      return res.status(400).json({ message: "Only accepted connections can be deleted this way" });
    }
    await connection.deleteOne();
    res.json({ message: "Connection deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  searchUsers,
  sendRequest,
  acceptRequest,
  addConnectionDirect,
  getIncomingRequests,
  getConnections,
  deleteRequest,
  deleteConnection,
};