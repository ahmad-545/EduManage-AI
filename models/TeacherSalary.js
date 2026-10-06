import mongoose from 'mongoose';

const TeacherSalarySchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required'],
    },
    month: {
      type: String, // e.g. "October 2026"
      required: [true, 'Salary month is required'],
    },
    baseSalary: {
      type: Number,
      required: true,
      default: 50000,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
      required: true,
    },
    paidDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      default: 'Bank Transfer',
    },
    transactionId: {
      type: String,
      default: '',
      trim: true,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// One salary record per teacher per month
TeacherSalarySchema.index({ teacherId: 1, month: 1 }, { unique: true });

export default mongoose.models.TeacherSalary || mongoose.model('TeacherSalary', TeacherSalarySchema);
