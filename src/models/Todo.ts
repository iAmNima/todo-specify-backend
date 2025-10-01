import mongoose, { Document, Schema } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  description?: string;
  due_date?: Date;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  status: 'pending' | 'completed';
  user_id: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const todoSchema = new Schema<ITodo>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  due_date: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field on save
todoSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const Todo = mongoose.model<ITodo>('Todo', todoSchema);