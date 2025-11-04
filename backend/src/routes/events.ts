import express from 'express';
import { auth } from '../middleware/auth.js';
import Event from '../models/Event.js';
import { Types } from 'mongoose';

const eventRoutes = express.Router();

// Get all events for the logged-in user
eventRoutes.get('/', auth, async (req: any, res) => {
  try {
    const events = await Event.find({ userId: req.user.userId })
      .sort({ startTime: 1 });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single event
eventRoutes.get('/:id', auth, async (req: any, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new event
eventRoutes.post('/', auth, async (req: any, res) => {
  try {
    const { title, startTime, endTime, status = 'BUSY' } = req.body;

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, start time, and end time are required' });
    }

    // Validate time order
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const event = new Event({
      title,
      startTime,
      endTime,
      status,
      userId: req.user.userId
    });

    await event.save();
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update an event
eventRoutes.put('/:id', auth, async (req: any, res) => {
  try {
    const { title, startTime, endTime, status } = req.body;

    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (title) event.title = title;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (status) event.status = status;

    // Validate time order if times are being updated
    if (startTime || endTime) {
      const start = startTime ? new Date(startTime) : event.startTime;
      const end = endTime ? new Date(endTime) : event.endTime;
      
      if (start >= end) {
        return res.status(400).json({ message: 'End time must be after start time' });
      }
    }

    await event.save();
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an event
eventRoutes.delete('/:id', auth, async (req: any, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update event status (make swappable/busy)
eventRoutes.patch('/:id/status', auth, async (req: any, res) => {
  try {
    const { status } = req.body;

    if (!['BUSY', 'SWAPPABLE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = status;
    await event.save();

    res.json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default eventRoutes;