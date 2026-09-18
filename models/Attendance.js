import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    date: {
      type: String, // Store as YYYY-MM-DD for straightforward date comparisons without timezone skew
      required: [true, 'Date is required (YYYY-MM-DD)'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a student has exactly one attendance record per subject per date
AttendanceSchema.index({ studentId: 1, subjectId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
