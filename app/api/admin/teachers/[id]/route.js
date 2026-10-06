import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import TeacherClass from '@/models/TeacherClass';
import Schedule from '@/models/Schedule';
import TeacherAttendance from '@/models/TeacherAttendance';
import TeacherSalary from '@/models/TeacherSalary';
import { getServerAuthSession } from '@/lib/permissions';

export async function GET(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const teacher = await User.findById(id).select('-password');
    if (!teacher || teacher.role !== 'teacher') {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // 1. Fetch Class and Subject Assignments
    const assignments = await TeacherClass.find({ teacherId: id })
      .populate('classId', 'className section')
      .populate('subjectId', 'subjectName');

    const assignmentIds = assignments.map((a) => a._id);

    // 2. Fetch Weekly Timetable Schedules
    const schedules = await Schedule.find({ teacherClassId: { $in: assignmentIds } })
      .populate({
        path: 'teacherClassId',
        populate: [
          { path: 'classId', select: 'className section' },
          { path: 'subjectId', select: 'subjectName' },
        ],
      })
      .sort({ day: 1, timeSlot: 1 });

    // 3. Fetch Full Attendance Log
    const attendanceHistory = await TeacherAttendance.find({ teacherId: id })
      .sort({ date: -1 })
      .limit(100);

    // 4. Group Attendance by Month
    const monthMap = new Map();
    attendanceHistory.forEach((att) => {
      // date is "YYYY-MM-DD"
      const ym = att.date.substring(0, 7); // "YYYY-MM"
      if (!monthMap.has(ym)) {
        const [year, monthNum] = ym.split('-');
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
          new Date(Number(year), Number(monthNum) - 1, 1)
        );
        monthMap.set(ym, {
          ymPrefix: ym,
          monthName,
          records: [],
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          halfDayCount: 0,
          missedLectures: [],
        });
      }

      const mData = monthMap.get(ym);
      mData.records.push(att);
      if (att.status === 'present') mData.presentCount++;
      else if (att.status === 'absent') mData.absentCount++;
      else if (att.status === 'late') mData.lateCount++;
      else if (att.status === 'half-day') {
        mData.halfDayCount++;
        if (att.missedLectures && att.missedLectures.length > 0) {
          mData.missedLectures.push(...att.missedLectures);
        }
      }
    });

    const monthlyAttendance = Array.from(monthMap.values()).map((m) => {
      const totalDays = m.records.length;
      const weighted = m.presentCount + (m.lateCount * 0.8) + (m.halfDayCount * 0.5);
      const attendanceRate = totalDays > 0 ? Math.round((weighted / totalDays) * 100) : 100;
      return {
        ...m,
        totalDays,
        attendanceRate,
      };
    });

    // 5. Fetch Salary History
    const salaries = await TeacherSalary.find({ teacherId: id }).sort({ createdAt: -1 });

    const now = new Date();
    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now);
    const currentMonthSalary = salaries.find((s) => s.month === currentMonth) || {
      month: currentMonth,
      baseSalary: teacher.baseSalary || 50000,
      deductions: 0,
      bonus: 0,
      netSalary: teacher.baseSalary || 50000,
      status: 'pending',
    };

    return NextResponse.json({
      teacher,
      assignments,
      schedules,
      attendanceHistory,
      monthlyAttendance,
      salaries,
      currentMonth,
      currentMonthSalary,
    });
  } catch (err) {
    console.error('Fetch teacher error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id } = await params;
    const { name, email, phone, status, password, baseSalary } = await req.json();

    await connectToDatabase();
    const teacher = await User.findById(id);

    if (!teacher || teacher.role !== 'teacher') {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Check if new email conflicts with another user
    if (email && email.toLowerCase().trim() !== teacher.email.toLowerCase()) {
      const emailExists = await User.findOne({
        _id: { $ne: id },
        email: email.toLowerCase().trim(),
      });
      if (emailExists) {
        return NextResponse.json({ error: 'Email is already used by another user account.' }, { status: 409 });
      }
      teacher.email = email.toLowerCase().trim();
    }

    if (name) teacher.name = name.trim();
    if (phone !== undefined) teacher.phone = phone.trim();
    if (status && ['active', 'pending'].includes(status)) teacher.status = status;
    if (baseSalary !== undefined && !isNaN(Number(baseSalary))) {
      teacher.baseSalary = Number(baseSalary);
    }

    // Optional password reset
    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      teacher.password = await bcrypt.hash(password.trim(), salt);
    }

    await teacher.save();

    return NextResponse.json({
      success: true,
      message: `Teacher ${teacher.name} updated successfully!`,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        status: teacher.status,
        role: teacher.role,
      },
    });
  } catch (err) {
    console.error('Update teacher error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== 'teacher') {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Find all assignments for this teacher
    const assignments = await TeacherClass.find({ teacherId: id });
    const assignmentIds = assignments.map((a) => a._id);

    // Cascade delete schedules
    if (assignmentIds.length > 0) {
      await Schedule.deleteMany({ teacherClassId: { $in: assignmentIds } });
    }

    // Cascade delete assignments
    await TeacherClass.deleteMany({ teacherId: id });

    // Cascade delete teacher attendance records
    await TeacherAttendance.deleteMany({ teacherId: id });

    // Delete user account
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Teacher ${teacher.name} and all related assignments and timetables have been deleted.`,
    });
  } catch (err) {
    console.error('Delete teacher error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
