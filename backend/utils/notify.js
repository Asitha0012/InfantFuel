import Notification from "../models/Notification.js";

export const createNotification = async ({ user, type, message, link, createdBy }) => {
  await Notification.create({ user, type, message, link, createdBy });
};