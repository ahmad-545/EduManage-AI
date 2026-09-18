import mongoose from 'mongoose';

const GradeSchema = new mongoose.Schema(
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
    examType: {
      type: String,
      required: [true, 'Exam type is required (e.g. Midterm, Final, Monthly Test)'],
      trim: true,
    },
    marks: {
      type: Number,
      required: [true, 'Marks is required'],
      min: 0,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

GradeSchema.index({ studentId: 1, subjectId: 1, examType: 1 }, { unique: true });

export default mongoose.models.Grade || mongoose.model('Grade', GradeSchema);
