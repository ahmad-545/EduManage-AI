import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Student from '../../../../models/Student';
import Subject from '../../../../models/Subject';
import TeacherClass from '../../../../models/TeacherClass';
import Attendance from '../../../../models/Attendance';
import Grade from '../../../../models/Grade';
import Quiz from '../../../../models/Quiz';
import QuizResult from '../../../../models/QuizResult';
import Schedule from '../../../../models/Schedule';
import Fee from '../../../../models/Fee';
import { getServerAuthSession } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 403 });
    }

    const studentId = session.user.id;
    await connectToDatabase();

    const student = await Student.findById(studentId)
      .populate('classId', 'className section')
      .select('-password');

    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    const classId = student.classId?._id;
    if (!classId) {
      return NextResponse.json({ student, subjects: [] });
    }

    // Check fee payment status
    const pendingFeesCount = await Fee.countDocuments({ studentId, status: 'pending' });
    const feeStatus = pendingFeesCount > 0 ? 'Pending Dues' : 'Up to Date (Paid)';

    // 1. Fetch all subjects for this class
    const subjects = await Subject.find({ classId }).sort({ subjectName: 1 });

    // 2. Compute academic summary per subject
    const subjectCards = await Promise.all(
      subjects.map(async (subj) => {
        // Teacher assignment & contact details
        const teacherClass = await TeacherClass.findOne({
          classId,
          subjectId: subj._id,
        }).populate('teacherId', 'name email phone');

        const teacherName = teacherClass?.teacherId?.name || 'Assigned Faculty';
        const teacherEmail = teacherClass?.teacherId?.email || 'faculty@edumanage.pk';
        const teacherPhone = teacherClass?.teacherId?.phone || '';

        // Lecture schedule slots
        let scheduleSlots = [];
        if (teacherClass) {
          scheduleSlots = await Schedule.find({ teacherClassId: teacherClass._id });
        }

        // Attendance stats for this subject
        const attendanceLogs = await Attendance.find({
          studentId,
          subjectId: subj._id,
        });

        const totalAttendanceDays = attendanceLogs.length;
        const presentDays = attendanceLogs.filter((a) => a.status === 'present').length;
        const lateDays = attendanceLogs.filter((a) => a.status === 'late').length;
        const attendancePercent =
          totalAttendanceDays > 0
            ? Math.round(((presentDays + lateDays * 0.5) / totalAttendanceDays) * 100)
            : 100;

        // Quizzes for this subject
        const quizzes = await Quiz.find({ subjectId: subj._id });
        const quizIds = quizzes.map((q) => q._id);
        const quizResults = await QuizResult.find({
          quizId: { $in: quizIds },
          studentId,
        });

        let totalQuizMarksObtained = 0;
        let totalQuizMaxMarks = 0;
        quizResults.forEach((qr) => {
          const quizObj = quizzes.find((q) => q._id.toString() === qr.quizId.toString());
          if (quizObj) {
            totalQuizMarksObtained += qr.marksObtained;
            totalQuizMaxMarks += quizObj.maxMarks;
          }
        });

        const quizAveragePercent =
          totalQuizMaxMarks > 0
            ? Math.round((totalQuizMarksObtained / totalQuizMaxMarks) * 100)
            : null;

        // Latest Exam Grade
        const latestGrade = await Grade.findOne({
          studentId,
          subjectId: subj._id,
        }).sort({ createdAt: -1 });

        let currentGrade = 'In Progress';
        let gradeMarks = null;
        let examType = 'Term Assessment';
        if (latestGrade) {
          examType = latestGrade.examType || 'Term Assessment';
          const pct = Math.round((latestGrade.marks / (latestGrade.totalMarks || 100)) * 100);
          gradeMarks = `${latestGrade.marks}/${latestGrade.totalMarks || 100} (${pct}%)`;
          if (pct >= 85) currentGrade = 'A+';
          else if (pct >= 75) currentGrade = 'A';
          else if (pct >= 65) currentGrade = 'B';
          else if (pct >= 50) currentGrade = 'C';
          else currentGrade = 'D';
        }

        return {
          subjectId: subj._id,
          subjectName: subj.subjectName,
          teacherName,
          teacherEmail,
          teacherPhone,
          scheduleSlots: scheduleSlots.map((s) => ({
            day: s.day,
            timeSlot: s.timeSlot,
          })),
          attendancePercent,
          attendanceLogsCount: totalAttendanceDays,
          presentDays,
          quizAveragePercent,
          quizzesCount: quizResults.length,
          currentGrade,
          latestExamMarks: gradeMarks,
          examType,
        };
      })
    );

    return NextResponse.json({
      student: {
        ...student.toObject(),
        feeStatus,
        admissionDate: student.createdAt,
      },
      subjects: subjectCards,
    });
  } catch (err) {
    console.error('Fetch student my-data error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
