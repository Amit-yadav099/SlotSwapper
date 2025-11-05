import express from 'express';
import { auth } from '../middleware/auth.js';
import Event from '../models/Event.js';
import { Types } from 'mongoose';

const router = express.Router();

// Get all events for authenticated user
router.get('/', auth, async (req: any, res) => {
  try {
    console.log('Fetching events for user:', req.user.userId);
    
    const events = await Event.find({ userId: req.user.userId })
      .sort({ startTime: 1 })
      .lean();

    console.log(`Found ${events.length} events for user`);
    
    res.json({
      message: 'Events retrieved successfully',
      count: events.length,
      events
    });
  } catch (error: any) {
    console.error('Get events error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve events',
      error: error.message 
    });
  }
});

// Get single event
router.get('/:id', auth, async (req: any, res) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        message: 'Invalid event ID format' 
      });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    res.json({
      message: 'Event retrieved successfully',
      event
    });
  } catch (error: any) {
    console.error('Get event error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve event',
      error: error.message 
    });
  }
});

// Create new event
router.post('/', auth, async (req: any, res) => {
  try {
    const { title, startTime, endTime, status = 'BUSY' } = req.body;

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Title, start time, and end time are required' 
      });
    }

    // Validate time order
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
      return res.status(400).json({ 
        message: 'End time must be after start time' 
      });
    }

    // Check for overlapping events
    const overlappingEvent = await Event.findOne({
      userId: req.user.userId,
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    });

    if (overlappingEvent) {
      return res.status(400).json({ 
        message: 'Event overlaps with existing event' 
      });
    }

    const event = new Event({
      title,
      startTime: start,
      endTime: end,
      status,
      userId: req.user.userId
    });

    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error: any) {
    console.error('Create event error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }

    res.status(500).json({ 
      message: 'Failed to create event',
      error: error.message 
    });
  }
});

// Update event
router.put('/:id', auth, async (req: any, res) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        message: 'Invalid event ID format' 
      });
    }

    const { title, startTime, endTime, status } = req.body;

    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    // Update fields if provided
    if (title !== undefined) event.title = title;
    if (startTime !== undefined) event.startTime = new Date(startTime);
    if (endTime !== undefined) event.endTime = new Date(endTime);
    if (status !== undefined) event.status = status;

    // Validate time order if times are being updated
    if (startTime !== undefined || endTime !== undefined) {
      const start = startTime ? new Date(startTime) : event.startTime;
      const end = endTime ? new Date(endTime) : event.endTime;
      
      if (start >= end) {
        return res.status(400).json({ 
          message: 'End time must be after start time' 
        });
      }
    }

    await event.save();

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error: any) {
    console.error('Update event error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }

    res.status(500).json({ 
      message: 'Failed to update event',
      error: error.message 
    });
  }
});

// Delete event
router.delete('/:id', auth, async (req: any, res) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        message: 'Invalid event ID format' 
      });
    }

    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    res.json({
      message: 'Event deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete event error:', error);
    res.status(500).json({ 
      message: 'Failed to delete event',
      error: error.message 
    });
  }
});

// Update event status
router.patch('/:id/status', auth, async (req: any, res) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        message: 'Invalid event ID format' 
      });
    }

    const { status } = req.body;

    if (!status || !['BUSY', 'SWAPPABLE'].includes(status)) {
      return res.status(400).json({ 
        message: 'Valid status (BUSY or SWAPPABLE) is required' 
      });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    event.status = status;
    await event.save();

    res.json({
      message: 'Event status updated successfully',
      event
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      message: 'Failed to update event status',
      error: error.message 
    });
  }
});

export default router;