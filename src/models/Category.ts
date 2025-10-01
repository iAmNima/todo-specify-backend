import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  user_id: mongoose.Types.ObjectId;
  color?: string;
  created_at: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  color: {
    type: String,
    default: '#3B82F6',
    validate: {
      validator: function(v: string) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique category names per user
categorySchema.index({ name: 1, user_id: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>('Category', categorySchema);