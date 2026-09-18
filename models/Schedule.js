import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema(
  {
    teacherClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherClass',
      required: [true, 'TeacherClass assignment is required'],
    },
    day: {
      type: String,
      required: [true, 'Day of week is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required (e.g. 09:00 AM - 10:00 AM)'],
      trim: true,
    },
    room: {
      type: String,
      default: 'Room 101',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

ScheduleSchema.index({ teacherClassId: 1, day: 1, timeSlot: 1 });

export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
