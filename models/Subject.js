import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: [true, 'Please provide a subject name'],
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Subject must belong to a class'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a class doesn't have duplicate subject names
SubjectSchema.index({ classId: 1, subjectName: 1 }, { unique: true });

export default mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
