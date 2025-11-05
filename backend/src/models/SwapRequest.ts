import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISwapRequest extends Document {
  requesterSlotId: Types.ObjectId;
  targetSlotId: Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const swapRequestSchema: Schema = new Schema({
  requesterSlotId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Requester slot ID is required'],
    validate: {
      validator: async function(this: ISwapRequest, value: Types.ObjectId) {
        const event = await mongoose.model('Event').findById(value);
        return event !== null;
      },
      message: 'Requester slot does not exist'
    }
  },
  targetSlotId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Target slot ID is required'],
    validate: {
      validator: async function(this: ISwapRequest, value: Types.ObjectId) {
        const event = await mongoose.model('Event').findById(value);
        return event !== null;
      },
      message: 'Target slot does not exist'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['PENDING', 'ACCEPTED', 'REJECTED'],
      message: 'Status must be PENDING, ACCEPTED, or REJECTED'
    },
    default: 'PENDING'
  }
}, {
  timestamps: true
});

// Prevent duplicate swap requests for the same slots
swapRequestSchema.index({ requesterSlotId: 1, targetSlotId: 1 }, { unique: true });

// Index for efficient queries
swapRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ISwapRequest>('SwapRequest', swapRequestSchema);