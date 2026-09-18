import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Student from '../../../../models/Student';
import Subject from '../../../../models/Subject';
import Grade from '../../../../models/Grade';
import Quiz from '../../../../models/Quiz';
import QuizResult from '../../../../models/QuizResult';
import Attendance from '../../../../models/Attendance';
import { getServerAuthSession } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 403 });
    }

    const studentId = session.user.id;
    await connectToDatabase();

    const student = await Student.findById(studentId).populate('classId', 'className section');
    if (!student || !student.classId) {
      return NextResponse.json({ student, gradeBook: [] });
    }

    const subjects = await Subject.find({ classId: student.classId._id }).sort({ subjectName: 1 });

    const gradeBook = await Promise.all(
      subjects.map(async (subj) => {
        // Attendance
        const attRecords = await Attendance.find({ studentId, subjectId: subj._id });
        const present = attRecords.filter((a) => a.status === 'present').length;
        const late = attRecords.filter((a) => a.status === 'late').length;
        const attPct =
          attRecords.length > 0
            ? Math.round(((present + late * 0.5) / attRecords.length) * 100)
            : 100;

        // Quizzes
        const quizzes = await Quiz.find({ subjectId: subj._id });
        const quizIds = quizzes.map((q) => q._id);
        const quizResults = await QuizResult.find({
          quizId: { $in: quizIds },
          studentId,
        });

        let totalQMarks = 0;
        let totalQMax = 0;
        quizResults.forEach((qr) => {
          const q = quizzes.find((x) => x._id.toString() === qr.quizId.toString());
          if (q) {
            totalQMarks += qr.marksObtained;
            totalQMax += q.maxMarks;
          }
        });
        const quizAvg = totalQMax > 0 ? Math.round((totalQMarks / totalQMax) * 100) : 'N/A';

        // Exam Grades
        const examGrades = await Grade.find({ studentId, subjectId: subj._id });
        let examTotalObtained = 0;
        let examTotalMax = 0;
        examGrades.forEach((g) => {
          examTotalObtained += g.marks;
          examTotalMax += g.totalMarks || 100;
        });

        let finalGrade = 'Pending';
        let overallPercent = 0;

        if (examTotalMax > 0) {
          overallPercent = Math.round((examTotalObtained / examTotalMax) * 100);
          if (overallPercent >= 85) finalGrade = 'A+';
          else if (overallPercent >= 75) finalGrade = 'A';
          else if (overallPercent >= 65) finalGrade = 'B';
          else if (overallPercent >= 50) finalGrade = 'C';
          else finalGrade = 'D';
        }

        return {
          subjectName: subj.subjectName,
          attendancePercent: attPct,
          quizAverage: quizAvg,
          exams: examGrades.map((g) => ({
            examType: g.examType,
            marks: g.marks,
            totalMarks: g.totalMarks || 100,
          })),
          overallPercent: examTotalMax > 0 ? overallPercent : null,
          finalGrade,
        };
      })
    );

    return NextResponse.json({
      student,
      gradeBook,
    });
  } catch (err) {
    console.error('Fetch student grades error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
