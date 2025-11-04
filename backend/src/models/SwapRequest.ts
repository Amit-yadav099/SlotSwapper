import mongoose, { Document, Schema } from 'mongoose';

export interface ISwapRequest extends Document {
  requesterSlotId: mongoose.Types.ObjectId;
  targetSlotId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BUSY';
  createdAt: Date;
}

const SwapRequestSchema: Schema = new Schema({
  requesterSlotId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  targetSlotId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'], 
    default: 'PENDING' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISwapRequest>('SwapRequest', SwapRequestSchema);