import Event from "../models/Event.js";
import Connection from "../models/Connection.js";
import { createNotification } from "../utils/notify.js";

// Create a new event (healthcare provider only)
const createEvent = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const { title, date, place, details } = req.body;
    const event = new Event({
      title,
      date,
      place,
      details,
      createdBy: {
        userId: req.user._id,
        name: req.user.fullName,
        position: req.user.position,
      },
    });
    await event.save();
    // Notification trigger: notify all connected parents
    const connections = await Connection.find({
      from: req.user._id,
      status: "accepted",
    });
    for (const conn of connections) {
      await createNotification({
        user: conn.to, // parent
        type: "event_created",
        message: `${req.user.fullName} has created a new event.`,
        link: "/tracker",
        createdBy: req.user._id,
      });
    }
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all events (for calendar, visible to all)
const getEvents = async (req, res) => {
  try {
    // If user is a parent, only show events from connected providers
    if (!req.user.isAdmin) {
      // Find all providers this parent is connected to
      const connections = await Connection.find({
        to: req.user._id,
        status: "accepted",
      });
      const providerIds = connections.map((conn) => conn.from);
      // Only show events created by connected providers
      const events = await Event.find({
        "createdBy.userId": { $in: providerIds },
      });
      // Convert createdBy.userId to string for frontend compatibility
      const eventsWithStringIds = events.map((e) => ({
        ...e.toObject(),
        createdBy: {
          ...e.createdBy,
          userId: e.createdBy.userId.toString(),
        },
      }));
      return res.json(eventsWithStringIds);
    }
    // If user is a provider, show only their own events
    if (req.user.isAdmin) {
      const events = await Event.find({
        "createdBy.userId": req.user._id,
      });
      // Convert createdBy.userId to string for frontend compatibility
      const eventsWithStringIds = events.map((e) => ({
        ...e.toObject(),
        createdBy: {
          ...e.createdBy,
          userId: e.createdBy.userId.toString(),
        },
      }));
      return res.json(eventsWithStringIds);
    }
    // Default fallback (should not hit)
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single event by ID (for details view)
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an event (only creator healthcare provider can edit)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (
      !req.user.isAdmin ||
      event.createdBy.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    event.title = req.body.title || event.title;
    event.date = req.body.date || event.date;
    event.place = req.body.place || event.place;
    event.details = req.body.details || event.details;

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an event (only creator healthcare provider can delete)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (
      !req.user.isAdmin ||
      event.createdBy.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const eventController = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
};
export default eventController;