import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import TeacherAttendance from '@/models/TeacherAttendance';
import { getServerAuthSession } from '@/lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'teacher' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized: Teacher session required' }, { status: 403 });
    }

    const teacherId = session.user.id;
    const today = new Date().toISOString().split('T')[0];

    await connectToDatabase();

    // 1. Fetch today's attendance record
    const todayRecord = await TeacherAttendance.findOne({
      teacherId,
      date: today,
    });

    // 2. Fetch full attendance history for this teacher
    const history = await TeacherAttendance.find({ teacherId })
      .sort({ date: -1 })
      .limit(60);

    // 3. Compute stats
    const totalMarkedDays = history.length;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;

    history.forEach((h) => {
      if (h.status === 'present') presentCount++;
      else if (h.status === 'absent') absentCount++;
      else if (h.status === 'late') lateCount++;
      else if (h.status === 'half-day') halfDayCount++;
    });

    // Attendance percentage calculation: present=1, late=0.8, half-day=0.5, absent=0
    const weightedPresent = presentCount + (lateCount * 0.8) + (halfDayCount * 0.5);
    const attendancePercentage = totalMarkedDays > 0
      ? Math.round((weightedPresent / totalMarkedDays) * 100)
      : 100;

    return NextResponse.json({
      today,
      todayRecord: todayRecord
        ? {
            status: todayRecord.status,
            missedLectures: todayRecord.missedLectures || [],
            remarks: todayRecord.remarks || '',
            isMarked: true,
          }
        : {
            status: 'not-marked',
            missedLectures: [],
            remarks: '',
            isMarked: false,
          },
      stats: {
        totalMarkedDays,
        presentCount,
        absentCount,
        lateCount,
        halfDayCount,
        attendancePercentage,
      },
      history,
    });
  } catch (err) {
    console.error('Fetch teacher attendance status error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
