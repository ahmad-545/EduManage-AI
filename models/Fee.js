import mongoose from 'mongoose';

const FeeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    month: {
      type: String, // e.g. "September 2026", "October 2026"
      required: [true, 'Fee month is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'pending',
      required: true,
    },
    paidDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: 'Cash',
      trim: true,
    },
    transactionId: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a student has at most one fee record per month
FeeSchema.index({ studentId: 1, month: 1 }, { unique: true });

export default mongoose.models.Fee || mongoose.model('Fee', FeeSchema);
