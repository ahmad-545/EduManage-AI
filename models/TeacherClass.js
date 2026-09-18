import mongoose from 'mongoose';

const TeacherClassSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required'],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
  },
  {
    timestamps: true,
  }
);

TeacherClassSchema.index({ teacherId: 1, classId: 1, subjectId: 1 }, { unique: true });

export default mongoose.models.TeacherClass || mongoose.model('TeacherClass', TeacherClassSchema);
