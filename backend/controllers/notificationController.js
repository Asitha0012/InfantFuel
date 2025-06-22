import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Get notifications for logged-in user (most recent first)
export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit) || 5)
    .populate("createdBy", "fullName");
  res.json(notifications);
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
};