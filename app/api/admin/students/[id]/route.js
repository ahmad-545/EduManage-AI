import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import Grade from '@/models/Grade';
import QuizResult from '@/models/QuizResult';
import Fee from '@/models/Fee';
import { getServerAuthSession } from '@/lib/permissions';

import Subject from '@/models/Subject';
import TeacherClass from '@/models/TeacherClass';
import Schedule from '@/models/Schedule';
import Quiz from '@/models/Quiz';
import User from '@/models/User';

export async function GET(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Student profile access is Super Admin only.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const student = await Student.findById(id).populate('classId', 'className section').select('-password');
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 1. Fee Records
    const fees = await Fee.find({ studentId: id }).sort({ createdAt: -1 });

    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let currentMonthFee = null;

    fees.forEach((f) => {
      totalInvoiced += f.amount || 0;
      if (f.status === 'paid') {
        totalPaid += f.amount || 0;
      } else {
        totalPending += f.amount || 0;
      }
      if (f.month === currentMonth) {
        currentMonthFee = f;
      }
    });

    // 2. Attendance Records
    const attendanceRecords = await Attendance.find({ studentId: id })
      .populate('subjectId', 'subjectName')
      .sort({ date: -1 })
      .limit(60);

    const totalAttendanceDays = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((a) => a.status === 'present').length;
    const absentCount = attendanceRecords.filter((a) => a.status === 'absent').length;
    const lateCount = attendanceRecords.filter((a) => a.status === 'late').length;
    const attendanceRate = totalAttendanceDays > 0 ? Math.round((presentCount / totalAttendanceDays) * 100) : 100;

    // 3. Exam Grades
    const grades = await Grade.find({ studentId: id }).populate('subjectId', 'subjectName');
    let totalGradePct = 0;
    grades.forEach((g) => {
      if (g.totalMarks && g.totalMarks > 0) {
        totalGradePct += (g.marks / g.totalMarks) * 100;
      }
    });
    const avgGradePct = grades.length > 0 ? Math.round(totalGradePct / grades.length) : null;

    // 4. Quizzes
    const quizResults = await QuizResult.find({ studentId: id })
      .populate({
        path: 'quizId',
        select: 'title totalMarks subjectId',
        populate: { path: 'subjectId', select: 'subjectName' },
      })
      .sort({ createdAt: -1 });

    // 5. Weekly Class Timetable
    let timetable = [];
    if (student.classId) {
      const teacherClasses = await TeacherClass.find({ classId: student.classId._id || student.classId })
        .populate('teacherId', 'name email phone')
        .populate('subjectId', 'subjectName');

      const tcIds = teacherClasses.map((tc) => tc._id);
      timetable = await Schedule.find({ teacherClassId: { $in: tcIds } }).populate({
        path: 'teacherClassId',
        populate: [
          { path: 'teacherId', select: 'name email phone' },
          { path: 'subjectId', select: 'subjectName' },
        ],
      });
    }

    return NextResponse.json({
      student,
      fees,
      feeStats: {
        monthlyFee: student.monthlyFee ?? 5000,
        admissionFee: student.admissionFee ?? 0,
        totalInvoiced,
        totalPaid,
        totalPending,
        currentMonth,
        currentMonthFee,
      },
      attendance: attendanceRecords,
      attendanceStats: {
        total: totalAttendanceDays,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        rate: attendanceRate,
      },
      grades,
      avgGradePct,
      quizResults,
      timetable,
    });
  } catch (err) {
    console.error('Fetch student dossier error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Super Admin permissions required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { name, parentPhone, classId, section, rollNumber, password, monthlyFee, admissionFee } = await req.json();

    await connectToDatabase();
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (name) student.name = name.trim();
    if (parentPhone) student.parentPhone = parentPhone.trim();
    if (classId) student.classId = classId;
    if (section) student.section = section.toUpperCase().trim();
    if (rollNumber) student.rollNumber = parseInt(rollNumber, 10);
    if (monthlyFee !== undefined && !isNaN(Number(monthlyFee))) {
      student.monthlyFee = Math.max(0, Number(monthlyFee));
    }
    if (admissionFee !== undefined && !isNaN(Number(admissionFee))) {
      student.admissionFee = Math.max(0, Number(admissionFee));
    }
    if (password && password.trim().length >= 4) {
      const bcrypt = (await import('bcryptjs')).default;
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password.trim(), salt);
    }

    await student.save();

    return NextResponse.json({
      success: true,
      message: 'Student profile updated successfully!',
      student,
    });
  } catch (err) {
    console.error('Update student error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    await connectToDatabase();
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 1. Create a fee voucher for this specific student
    if (action === 'create-fee') {
      const { month, amount, dueDate, status, paymentMethod } = body;
      if (!month || !amount) {
        return NextResponse.json({ error: 'Month and Amount are required' }, { status: 400 });
      }

      const existing = await Fee.findOne({ studentId: id, month });
      if (existing) {
        return NextResponse.json({ error: `Fee voucher for "${month}" already exists for this student.` }, { status: 409 });
      }

      const isPaid = status === 'paid';
      const newFee = await Fee.create({
        studentId: id,
        month,
        amount: Number(amount),
        status: isPaid ? 'paid' : 'pending',
        paidDate: isPaid ? new Date() : null,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        paymentMethod: isPaid ? (paymentMethod || 'Cash') : 'Cash',
        transactionId: isPaid ? `TXN-${Date.now().toString().slice(-6)}` : '',
      });

      return NextResponse.json({
        success: true,
        message: `Fee voucher created for ${month}!`,
        fee: newFee,
      });
    }

    // 2. Mark specific fee as paid
    if (action === 'pay-fee') {
      const { feeId, paymentMethod, transactionId } = body;
      const fee = await Fee.findOne({ _id: feeId, studentId: id });
      if (!fee) {
        return NextResponse.json({ error: 'Fee record not found' }, { status: 404 });
      }

      fee.status = 'paid';
      fee.paidDate = new Date();
      fee.paymentMethod = paymentMethod || 'Cash';
      fee.transactionId = transactionId || `TXN-${Date.now().toString().slice(-6)}`;
      await fee.save();

      return NextResponse.json({
        success: true,
        message: 'Fee payment marked successfully!',
        fee,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Student fee action error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerAuthSession();

    // Critical Business Rule: Only Super Admin can delete student records
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Super Admin permissions required to delete student records.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Cascade delete related records
    await Attendance.deleteMany({ studentId: id });
    await Grade.deleteMany({ studentId: id });
    await QuizResult.deleteMany({ studentId: id });
    await Fee.deleteMany({ studentId: id });
    await Student.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Student ${student.name} and associated academic records have been removed.`,
    });
  } catch (err) {
    console.error('Delete student error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
