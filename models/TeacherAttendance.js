import mongoose from 'mongoose';

const TeacherAttendanceSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required'],
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Date is required (YYYY-MM-DD)'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day'],
      default: 'present',
      required: true,
    },
    missedLectures: {
      type: [String],
      default: [],
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

// Compound unique index: One attendance record per teacher per date
TeacherAttendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

export default mongoose.models.TeacherAttendance || mongoose.model('TeacherAttendance', TeacherAttendanceSchema);
