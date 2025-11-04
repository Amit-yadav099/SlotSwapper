import express, { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { auth } from '../middleware/auth.js';
import Event from '../models/Event.js';
import SwapRequest from '../models/SwapRequest.js';

const swapRoutes = express.Router();

// Define custom Request type to include user info from auth middleware
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}

/* ----------------------------------------------------
   📍 GET /swappable-slots
   Get all available slots from other users
---------------------------------------------------- */
swapRoutes.get('/swappable-slots', auth, async (req: AuthRequest, res: Response) => {
  try {
    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      userId: { $ne: new Types.ObjectId(req.user!.userId) },
    })
      .populate('userId', 'name email')
      .sort({ startTime: 1 });

    res.json(swappableSlots);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/* ----------------------------------------------------
   📍 POST /swap-request
   Create a swap request between two slots
---------------------------------------------------- */
swapRoutes.post('/swap-request', auth, async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { mySlotId, theirSlotId } = req.body;

    if (!mySlotId || !theirSlotId) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Both slot IDs are required' });
    }

    // Fetch both slots
    const mySlot = await Event.findOne({
      _id: mySlotId,
      userId: req.user!.userId,
    }).session(session);

    const theirSlot = await Event.findById(theirSlotId).session(session);

    if (!mySlot || !theirSlot) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'One or both slots not found' });
    }

    if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Both slots must be swappable' });
    }

    if (mySlot.userId.toString() === theirSlot.userId.toString()) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot swap with yourself' });
    }

    // Prevent duplicate requests
    const existing = await SwapRequest.findOne({
      requesterSlotId: mySlotId,
      targetSlotId: theirSlotId,
      status: 'PENDING',
    }).session(session);

    if (existing) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Swap request already exists' });
    }

    // Create swap request
    const swapRequest = new SwapRequest({
      requesterSlotId: mySlotId,
      targetSlotId: theirSlotId,
      status: 'PENDING',
    });

    // Update slots
    mySlot.status = 'SWAP_PENDING';
    theirSlot.status = 'SWAP_PENDING';

    await mySlot.save({ session });
    await theirSlot.save({ session });
    await swapRequest.save({ session });

    await session.commitTransaction();

    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('requesterSlotId')
      .populate('targetSlotId');

    res.status(201).json(populatedRequest);
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

/* ----------------------------------------------------
   📍 POST /swap-response/:requestId
   Accept or reject a swap request
---------------------------------------------------- */
swapRoutes.post('/swap-response/:requestId', auth, async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { accepted } = req.body;
    const { requestId } = req.params;

    const swapRequest = await SwapRequest.findById(requestId)
      .populate('requesterSlotId')
      .populate('targetSlotId')
      .session(session);

    if (!swapRequest) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Swap request not found' });
    }

    const targetSlotUserId =
      (swapRequest.targetSlotId as any)?.userId?._id?.toString() ||
      (swapRequest.targetSlotId as any)?.userId?.toString();

    if (targetSlotUserId !== req.user!.userId) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    if (swapRequest.status !== 'PENDING') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Swap request already processed' });
    }

    if (accepted) {
      // Swap the slot owners
      const requesterSlot: any = swapRequest.requesterSlotId;
      const targetSlot: any = swapRequest.targetSlotId;

      const tempUserId = requesterSlot.userId;
      requesterSlot.userId = targetSlot.userId;
      targetSlot.userId = tempUserId;

      requesterSlot.status = 'BUSY';
      targetSlot.status = 'BUSY';
      swapRequest.status = 'ACCEPTED';

      await requesterSlot.save({ session });
      await targetSlot.save({ session });
    } else {
      // Reject and reset both slots
      const requesterSlot: any = swapRequest.requesterSlotId;
      const targetSlot: any = swapRequest.targetSlotId;

      requesterSlot.status = 'SWAPPABLE';
      targetSlot.status = 'SWAPPABLE';
      swapRequest.status = 'REJECTED';

      await requesterSlot.save({ session });
      await targetSlot.save({ session });
    }

    await swapRequest.save({ session });
    await session.commitTransaction();

    const updatedRequest = await SwapRequest.findById(requestId)
      .populate('requesterSlotId')
      .populate('targetSlotId');

    res.json(updatedRequest);
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

/* ----------------------------------------------------
   📍 GET /my-requests
   Get all incoming and outgoing swap requests for the user
---------------------------------------------------- */
swapRoutes.get('/my-requests', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.userId);

    const incomingRequests = await SwapRequest.find({
      status: { $in: ['PENDING', 'ACCEPTED', 'REJECTED'] },
    })
      .populate({
        path: 'targetSlotId',
        match: { userId },
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'requesterSlotId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    const outgoingRequests = await SwapRequest.find({
      status: { $in: ['PENDING', 'ACCEPTED', 'REJECTED'] },
    })
      .populate({
        path: 'requesterSlotId',
        match: { userId },
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'targetSlotId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    // Filter only valid populated requests
    const filteredIncoming = incomingRequests.filter(req => req.targetSlotId);
    const filteredOutgoing = outgoingRequests.filter(req => req.requesterSlotId);

    res.json({
      incoming: filteredIncoming,
      outgoing: filteredOutgoing,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default swapRoutes;
