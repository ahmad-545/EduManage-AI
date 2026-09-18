import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Please provide a class name (e.g. Class 9, Class 10)'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Please provide a section (e.g. A, B, C)'],
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of className + section (e.g. Class 10 - Section A)
ClassSchema.index({ className: 1, section: 1 }, { unique: true });

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);
