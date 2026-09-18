import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [1, 'Max marks must be at least 1'],
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
