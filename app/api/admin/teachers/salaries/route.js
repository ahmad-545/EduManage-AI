import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import TeacherAttendance from '@/models/TeacherAttendance';
import TeacherSalary from '@/models/TeacherSalary';
import { getServerAuthSession } from '@/lib/permissions';

// Helper to convert "October 2026" to "2026-10"
function monthNameToYearMonth(monthStr) {
  if (!monthStr) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const parts = monthStr.trim().split(' ');
  if (parts.length === 2) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const mIdx = monthNames.findIndex((m) => m.toLowerCase() === parts[0].toLowerCase());
    if (mIdx !== -1) {
      return `${parts[1]}-${String(mIdx + 1).padStart(2, '0')}`;
    }
  }
  return monthStr;
}

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const currentMonthDefault = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now);
    const month = searchParams.get('month') || currentMonthDefault; // e.g., "October 2026"
    const ymPrefix = monthNameToYearMonth(month); // e.g. "2026-10"

    await connectToDatabase();

    // 1. Fetch all active teachers
    const teachers = await User.find({ role: 'teacher', status: 'active' })
      .select('-password')
      .sort({ name: 1 });

    // 2. Fetch all attendance records for this month (date starts with YYYY-MM)
    const monthAttendance = await TeacherAttendance.find({
      date: { $regex: `^${ymPrefix}` },
    });

    // 3. Fetch existing salary records for this month
    const existingSalaries = await TeacherSalary.find({ month });
    const salaryMap = new Map();
    existingSalaries.forEach((s) => {
      salaryMap.set(s.teacherId.toString(), s);
    });

    let totalPayroll = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;

    // 4. Combine attendance counts and salary records per teacher
    const report = await Promise.all(
      teachers.map(async (teacher) => {
        const teacherAtts = monthAttendance.filter(
          (a) => a.teacherId.toString() === teacher._id.toString()
        );

        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        let halfDayCount = 0;
        let missedLecturesAll = [];

        teacherAtts.forEach((a) => {
          if (a.status === 'present') presentCount++;
          else if (a.status === 'absent') absentCount++;
          else if (a.status === 'late') lateCount++;
          else if (a.status === 'half-day') {
            halfDayCount++;
            if (a.missedLectures && a.missedLectures.length > 0) {
              missedLecturesAll.push(...a.missedLectures);
            }
          }
        });

        const totalMarkedDays = teacherAtts.length;
        const weighted = presentCount + (lateCount * 0.8) + (halfDayCount * 0.5);
        const attendanceRate = totalMarkedDays > 0 ? Math.round((weighted / totalMarkedDays) * 100) : 100;

        // Salary Record (Existing or Auto-Generated Pending)
        let salary = salaryMap.get(teacher._id.toString());
        const baseSalary = salary ? salary.baseSalary : (teacher.baseSalary || 50000);
        const deductions = salary ? salary.deductions : 0;
        const bonus = salary ? salary.bonus : 0;
        const netSalary = salary ? salary.netSalary : (baseSalary - deductions + bonus);
        const status = salary ? salary.status : 'pending';

        // Auto-create salary document if not exists yet
        if (!salary) {
          salary = await TeacherSalary.create({
            teacherId: teacher._id,
            month,
            baseSalary,
            deductions: 0,
            bonus: 0,
            netSalary,
            status: 'pending',
          });
        }

        totalPayroll += netSalary;
        if (status === 'paid') {
          totalPaid += netSalary;
          paidCount++;
        } else {
          totalPending += netSalary;
          pendingCount++;
        }

        return {
          teacher: {
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone,
            baseSalary: teacher.baseSalary || 50000,
          },
          attendance: {
            totalMarkedDays,
            presentCount,
            absentCount,
            lateCount,
            halfDayCount,
            missedLecturesCount: missedLecturesAll.length,
            missedLectures: missedLecturesAll,
            attendanceRate,
          },
          salary: {
            _id: salary._id,
            month: salary.month,
            baseSalary: salary.baseSalary,
            deductions: salary.deductions || 0,
            bonus: salary.bonus || 0,
            netSalary: salary.netSalary,
            status: salary.status,
            paidDate: salary.paidDate || null,
            paymentMethod: salary.paymentMethod || 'Bank Transfer',
            transactionId: salary.transactionId || '',
            remarks: salary.remarks || '',
          },
        };
      })
    );

    return NextResponse.json({
      month,
      ymPrefix,
      summary: {
        totalTeachers: teachers.length,
        totalPayroll,
        totalPaid,
        totalPending,
        paidCount,
        pendingCount,
      },
      report,
    });
  } catch (err) {
    console.error('Fetch teacher salary report error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const {
      teacherId,
      month,
      status, // 'paid' | 'pending'
      baseSalary,
      deductions,
      bonus,
      paymentMethod,
      transactionId,
      remarks,
    } = await req.json();

    if (!teacherId || !month) {
      return NextResponse.json({ error: 'teacherId and month are required' }, { status: 400 });
    }

    await connectToDatabase();

    const base = Number(baseSalary) || 50000;
    const ded = Number(deductions) || 0;
    const bon = Number(bonus) || 0;
    const net = base - ded + bon;

    const updateDoc = {
      baseSalary: base,
      deductions: ded,
      bonus: bon,
      netSalary: net,
      status: status || 'pending',
      paymentMethod: paymentMethod || 'Bank Transfer',
      transactionId: transactionId || '',
      remarks: remarks || '',
      markedBy: session.user.id,
    };

    if (status === 'paid') {
      updateDoc.paidDate = new Date();
    } else {
      updateDoc.paidDate = null;
    }

    const salary = await TeacherSalary.findOneAndUpdate(
      { teacherId, month },
      { $set: updateDoc },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({
      success: true,
      message: `Salary for ${month} marked as ${status.toUpperCase()}!`,
      salary,
    });
  } catch (err) {
    console.error('Save teacher salary error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
