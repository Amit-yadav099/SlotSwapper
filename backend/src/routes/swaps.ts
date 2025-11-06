import express from 'express';
import { auth } from '../middleware/auth.js';
import Event from '../models/Event.js';
import SwapRequest from '../models/SwapRequest.js';
import { Types } from 'mongoose';
import { Request,Response } from 'express';
const swapRoutes = express.Router();

// Get all swappable slots from other users
swapRoutes.get('/swappable-slots', auth, async (req:Request, res:Response) => {
  try {
    console.log('Fetching swappable slots for user:', req.user?.userId);
    
    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      userId: { $ne: new Types.ObjectId(req.user?.userId) }
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
swapRoutes.post('/swap-request', auth, async (req:Request, res:Response) => {
  const session = await Event.startSession();
  session.startTransaction();

  try {
    const { mySlotId, theirSlotId } = req.body;

    console.log('Creating swap request:', { mySlotId, theirSlotId, userId: req.user?.userId });

    // Validate input
    if (!mySlotId || !theirSlotId) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Both mySlotId and theirSlotId are required' 
      });
    }

    if (!Types.ObjectId.isValid(mySlotId) || !Types.ObjectId.isValid(theirSlotId)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Invalid slot ID format' 
      });
    }

    // Get both slots within transaction
    const mySlot = await Event.findOne({
      _id: mySlotId,
      userId: req.user?.userId
    }).session(session);

    const theirSlot = await Event.findOne({
      _id: theirSlotId
    }).session(session);

    // Validate slots exist and are swappable
    if (!mySlot) {
      await session.abortTransaction();
      return res.status(404).json({ 
        message: 'Your slot not found' 
      });
    }

    if (!theirSlot) {
      await session.abortTransaction();
      return res.status(404).json({ 
        message: 'Target slot not found' 
      });
    }

    if (mySlot.status !== 'SWAPPABLE') {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Your slot is not swappable' 
      });
    }

    if (theirSlot.status !== 'SWAPPABLE') {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Target slot is not swappable' 
      });
    }

    if (mySlot.userId.toString() === theirSlot.userId.toString()) {
      await session.abortTransaction();
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

// Respond to swap request
swapRoutes.post('/swap-response/:requestId', auth, async (req:Request, res:Response) => {
  const session = await Event.startSession();
  session.startTransaction();

  try {
    const { accepted } = req.body;
    const { requestId } = req.params;

    console.log('Processing swap response:', { requestId, accepted, userId: req.user?.userId });

    if (!Types.ObjectId.isValid(requestId)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Invalid request ID format' 
      });
    }

    if (typeof accepted !== 'boolean') {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Accepted field must be a boolean' 
      });
    }

    const swapRequest = await SwapRequest.findById(requestId)
      .populate('requesterSlotId')
      .populate('targetSlotId')
      .session(session);

    if (!swapRequest) {
      await session.abortTransaction();
      return res.status(404).json({ 
        message: 'Swap request not found' 
      });
    }
    const requesterSlot: any = swapRequest.requesterSlotId;
    const targetSlot: any = swapRequest.targetSlotId;

    // Check if the current user owns the target slot
    if (targetSlot.userId.toString() !== req.user?.userId) {
      await session.abortTransaction();
      return res.status(403).json({ 
        message: 'Not authorized to respond to this request' 
      });
    }

    if (swapRequest.status !== 'PENDING') {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Swap request has already been processed' 
      });
    }

    if (accepted) {
      // ACCEPTED: Swap the owners
      const tempUserId = requesterSlot.userId;
      requesterSlot.userId = targetSlot.userId;
      targetSlot.userId = tempUserId;

      // Set both slots back to BUSY
      requesterSlot.status = 'BUSY';
      targetSlot.status = 'BUSY';

      swapRequest.status = 'ACCEPTED';
      
      console.log('Swap accepted - owners swapped');
    } else {
      // REJECTED: Set both slots back to SWAPPABLE
      requesterSlot.status = 'SWAPPABLE';
      targetSlot.status = 'SWAPPABLE';

      swapRequest.status = 'REJECTED';
      
      console.log('Swap rejected - slots returned to swappable');
    }

    await requesterSlot.save({ session });
    await targetSlot.save({ session });
    await swapRequest.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: `Swap request ${accepted ? 'accepted' : 'rejected'} successfully`,
      swapRequest
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Swap response error:', error);
    res.status(500).json({ 
      message: 'Failed to process swap response',
      error: error.message 
    });
  }
});

// Get user's swap requests (incoming and outgoing)
swapRoutes.get('/my-requests', auth, async (req:Request, res:Response) => {
  try {
    console.log('Fetching swap requests for user:', req.user?.userId);

    // Get incoming requests (where user is the target slot owner)
    const incomingRequests = await SwapRequest.find()
      .populate({
        path: 'targetSlotId',
        match: { userId: new Types.ObjectId(req.user?.userId) },
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'requesterSlotId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Get outgoing requests (where user is the requester)
    const outgoingRequests = await SwapRequest.find()
      .populate({
        path: 'requesterSlotId',
        match: { userId: new Types.ObjectId(req.user?.userId) },
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'targetSlotId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out null populated slots
    const filteredIncoming = incomingRequests.filter(request => request.targetSlotId);
    const filteredOutgoing = outgoingRequests.filter(request => request.requesterSlotId);

    console.log(`Found ${filteredIncoming.length} incoming and ${filteredOutgoing.length} outgoing requests`);

    res.json({
      message: 'Swap requests retrieved successfully',
      incoming: filteredIncoming,
      outgoing: filteredOutgoing
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