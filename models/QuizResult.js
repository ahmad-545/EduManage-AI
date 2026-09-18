import mongoose from 'mongoose';

const QuizResultSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

QuizResultSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);
