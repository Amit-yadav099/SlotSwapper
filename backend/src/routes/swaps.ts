import express from 'express';
import { auth } from '../middleware/auth.js';
import Event from '../models/Event.js';
import SwapRequest from '../models/SwapRequest.js';
import { Types } from 'mongoose';
import { Request, Response } from 'express';

const swapRoutes = express.Router();

// Helper function to get userId from request with proper typing
const getUserId = (req: Request): string | null => {
  if (req.user && typeof req.user === 'object' && 'userId' in req.user) {
    return (req.user as any).userId;
  }
  return null;
};

// Get all swappable slots from other users
swapRoutes.get('/swappable-slots', auth, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    console.log('Fetching swappable slots for user:', userId);
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'User not authenticated' 
      });
    }

    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      userId: { $ne: new Types.ObjectId(userId) }
    })
      .populate('userId', 'name email')
      .sort({ startTime: 1 })
      .lean();

    console.log(`Found ${swappableSlots.length} swappable slots`);
    
    res.json({
      message: 'Swappable slots retrieved successfully',
      count: swappableSlots.length,
      slots: swappableSlots
    });
  } catch (error: any) {
    console.error('Get swappable slots error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve swappable slots',
      error: error.message 
    });
  }
});

// Create swap request
swapRoutes.post('/swap-request', auth, async (req: Request, res: Response) => {
  const session = await Event.startSession();
  session.startTransaction();

  try {
    const { mySlotId, theirSlotId } = req.body;
    const userId = getUserId(req);

    console.log('Creating swap request:', { mySlotId, theirSlotId, userId });

    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ 
        message: 'User not authenticated' 
      });
    }

    // Validate input
    if (!mySlotId || !theirSlotId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Both mySlotId and theirSlotId are required' 
      });
    }

    if (!Types.ObjectId.isValid(mySlotId) || !Types.ObjectId.isValid(theirSlotId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Invalid slot ID format' 
      });
    }

    // Get both slots within transaction
    const mySlot = await Event.findOne({
      _id: mySlotId,
      userId: userId
    }).session(session);

    const theirSlot = await Event.findOne({
      _id: theirSlotId
    }).session(session);

    // Validate slots exist and are swappable
    if (!mySlot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        message: 'Your slot not found' 
      });
    }

    if (!theirSlot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        message: 'Target slot not found' 
      });
    }

    if (mySlot.status !== 'SWAPPABLE') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Your slot is not swappable' 
      });
    }

    if (theirSlot.status !== 'SWAPPABLE') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Target slot is not swappable' 
      });
    }

    if (mySlot.userId.toString() === theirSlot.userId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Cannot swap with yourself' 
      });
    }

    // Check if swap request already exists
    const existingRequest = await SwapRequest.findOne({
      $or: [
        { requesterSlotId: mySlotId, targetSlotId: theirSlotId },
        { requesterSlotId: theirSlotId, targetSlotId: mySlotId }
      ]
    }).session(session);

    if (existingRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Swap request already exists for these slots' 
      });
    }

    // Create swap request
    const swapRequest = new SwapRequest({
      requesterSlotId: mySlotId,
      targetSlotId: theirSlotId
    });

    // Update slots to pending
    mySlot.status = 'SWAP_PENDING';
    theirSlot.status = 'SWAP_PENDING';

    await mySlot.save({ session });
    await theirSlot.save({ session });
    await swapRequest.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Populate the response for better client experience
    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('requesterSlotId')
      .populate('targetSlotId')
      .lean();

    console.log('Swap request created successfully:', swapRequest._id);

    res.status(201).json({
      message: 'Swap request created successfully',
      swapRequest: populatedRequest
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Create swap request error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Swap request already exists for these slots' 
      });
    }

    res.status(500).json({ 
      message: 'Failed to create swap request',
      error: error.message 
    });
  }
});

// Get user's swap requests (incoming and outgoing)
swapRoutes.get('/my-requests', auth, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    console.log('Fetching swap requests for user:', userId);

    if (!userId) {
      return res.status(401).json({ 
        message: 'User not authenticated' 
      });
    }

    // Get incoming requests (where user is the target slot owner)
    const incomingRequests = await SwapRequest.find({ 'targetSlotId.userId': userId })
      .populate('requesterSlotId')
      .populate('targetSlotId')
      .sort({ createdAt: -1 })
      .lean();

    // Get outgoing requests (where user is the requester)
    const outgoingRequests = await SwapRequest.find({ 'requesterSlotId.userId': userId })
      .populate('requesterSlotId')
      .populate('targetSlotId')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${incomingRequests.length} incoming and ${outgoingRequests.length} outgoing requests`);

    res.json({
      message: 'Swap requests retrieved successfully',
      incoming: incomingRequests,
      outgoing: outgoingRequests
    });
  } catch (error: any) {
    console.error('Get swap requests error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve swap requests',
      error: error.message 
    });
  }
});

export default swapRoutes;