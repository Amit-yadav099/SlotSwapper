import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  userId: mongoose.Types.ObjectId;
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'], 
    default: 'BUSY' 
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.model<IEvent>('Event', EventSchema);