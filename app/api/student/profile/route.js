import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Student from '../../../../models/Student';
import Fee from '../../../../models/Fee';
import Attendance from '../../../../models/Attendance';
import Grade from '../../../../models/Grade';
import QuizResult from '../../../../models/QuizResult';
import Subject from '../../../../models/Subject';
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

    // 1. Fee Records & Summaries
    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
    const fees = await Fee.find({ studentId }).sort({ createdAt: -1 });

    let totalPaid = 0;
    let totalPending = 0;
    let currentMonthFee = null;

    fees.forEach((f) => {
      if (f.status === 'paid') {
        totalPaid += f.amount || 0;
      } else {
        totalPending += f.amount || 0;
      }
      if (f.month === currentMonth) {
        currentMonthFee = f;
      }
    });

    // 2. Attendance Summary
    const attendanceLogs = await Attendance.find({ studentId })
      .populate('subjectId', 'subjectName')
      .sort({ date: -1 });

    const totalAttendanceDays = attendanceLogs.length;
    const presentCount = attendanceLogs.filter((a) => a.status === 'present').length;
    const absentCount = attendanceLogs.filter((a) => a.status === 'absent').length;
    const lateCount = attendanceLogs.filter((a) => a.status === 'late').length;
    const attendanceRate = totalAttendanceDays > 0 ? Math.round((presentCount / totalAttendanceDays) * 100) : 100;

    // 3. Exam Grades
    const grades = await Grade.find({ studentId }).populate('subjectId', 'subjectName').sort({ createdAt: -1 });
    let totalGradePct = 0;
    grades.forEach((g) => {
      if (g.totalMarks && g.totalMarks > 0) {
        totalGradePct += (g.marks / g.totalMarks) * 100;
      }
    });
    const avgGradePct = grades.length > 0 ? Math.round(totalGradePct / grades.length) : null;

    // 4. Quizzes
    const quizResults = await QuizResult.find({ studentId })
      .populate({
        path: 'quizId',
        select: 'title totalMarks maxMarks subjectId',
        populate: { path: 'subjectId', select: 'subjectName' },
      })
      .sort({ createdAt: -1 });

    const adminPhone = process.env.ADMIN_WHATSAPP || process.env.SUPPORT_PHONE || '+923008887766';

    return NextResponse.json({
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        parentPhone: student.parentPhone,
        admissionDate: student.createdAt,
        className: student.classId?.className || 'Class',
        section: student.section || student.classId?.section || 'A',
        monthlyFee: student.monthlyFee ?? 5000,
        admissionFee: student.admissionFee ?? 0,
        mustChangePassword: student.mustChangePassword,
      },
      feeStats: {
        currentMonth,
        currentMonthFee,
        totalPaid,
        totalPending,
        allInvoices: fees,
      },
      attendanceStats: {
        total: totalAttendanceDays,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        rate: attendanceRate,
        recentLogs: attendanceLogs.slice(0, 15),
      },
      academicStats: {
        grades,
        avgGradePct,
        quizResults,
      },
      supportInfo: {
        schoolName: process.env.NEXT_PUBLIC_SCHOOL_NAME || 'EduManage AI Academy',
        adminWhatsApp: adminPhone,
      },
    });
  } catch (err) {
    console.error('Fetch student profile error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
