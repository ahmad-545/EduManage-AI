import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide student name'],
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Please assign a class'],
    },
    section: {
      type: String,
      required: [true, 'Please assign a section'],
      trim: true,
      uppercase: true,
    },
    rollNumber: {
      type: Number,
      required: [true, 'Please provide a roll number'],
    },
    email: {
      type: String,
      required: [true, 'Auto-generated student login email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    parentPhone: {
      type: String,
      required: [true, "Parent's WhatsApp/phone number is required"],
      trim: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
    monthlyFee: {
      type: Number,
      default: 5000,
      min: 0,
    },
    admissionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound uniqueness expectation on (classId, section, rollNumber)
StudentSchema.index({ classId: 1, section: 1, rollNumber: 1 }, { unique: true });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
