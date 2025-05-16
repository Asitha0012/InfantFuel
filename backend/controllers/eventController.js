import Event from "../models/Event.js";

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
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all events (for calendar, visible to all)
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
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