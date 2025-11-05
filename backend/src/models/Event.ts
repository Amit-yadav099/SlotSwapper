import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [2, 'Title must be at least 2 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(this: IEvent, value: Date) {
        return value < this.endTime;
      },
      message: 'Start time must be before end time'
    }
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(this: IEvent, value: Date) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'],
      message: 'Status must be BUSY, SWAPPABLE, or SWAP_PENDING'
    },
    default: 'BUSY'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ userId: 1, startTime: 1 });
eventSchema.index({ status: 1, startTime: 1 });

export default mongoose.model<IEvent>('Event', eventSchema);