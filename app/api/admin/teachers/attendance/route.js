import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import TeacherClass from '@/models/TeacherClass';
import Schedule from '@/models/Schedule';
import TeacherAttendance from '@/models/TeacherAttendance';
import { getServerAuthSession } from '@/lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Determine day name for this date (e.g., 'Monday', 'Tuesday')
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateObj);

    await connectToDatabase();

    // 1. Fetch all active teachers
    const teachers = await User.find({ role: 'teacher', status: 'active' })
      .select('-password')
      .sort({ name: 1 });

    // 2. Fetch existing attendance records for this date
    const attendanceRecords = await TeacherAttendance.find({ date });
    const attendanceMap = new Map();
    attendanceRecords.forEach((att) => {
      attendanceMap.set(att.teacherId.toString(), att);
    });

    // 3. For each teacher, assemble their today's schedule
    const teacherData = await Promise.all(
      teachers.map(async (t) => {
        const assignments = await TeacherClass.find({ teacherId: t._id })
          .populate('classId', 'className section')
          .populate('subjectId', 'subjectName');

        const assignmentIds = assignments.map((a) => a._id);

        const daySchedules = await Schedule.find({
          teacherClassId: { $in: assignmentIds },
          day: dayName,
        }).populate({
          path: 'teacherClassId',
          populate: [
            { path: 'classId', select: 'className section' },
            { path: 'subjectId', select: 'subjectName' },
          ],
        });

        const formattedSchedule = daySchedules.map((s) => {
          const tc = s.teacherClassId;
          return {
            _id: s._id,
            timeSlot: s.timeSlot,
            subjectName: tc?.subjectId?.subjectName || 'Subject',
            className: `${tc?.classId?.className || 'Class'} - ${tc?.classId?.section || ''}`,
            display: `${tc?.subjectId?.subjectName || 'Subject'} (${tc?.classId?.className || ''}-${tc?.classId?.section || ''}) [${s.timeSlot}]`,
          };
        });

        const existingAtt = attendanceMap.get(t._id.toString());

        return {
          _id: t._id,
          name: t.name,
          email: t.email,
          phone: t.phone,
          status: existingAtt ? existingAtt.status : 'present', // default
          missedLectures: existingAtt ? existingAtt.missedLectures || [] : [],
          remarks: existingAtt ? existingAtt.remarks || '' : '',
          isMarked: Boolean(existingAtt),
          todaySchedule: formattedSchedule,
        };
      })
    );

    return NextResponse.json({
      date,
      dayName,
      teachers: teacherData,
      totalCount: teachers.length,
      markedCount: attendanceRecords.length,
    });
  } catch (err) {
    console.error('Fetch teacher attendance error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { date, records } = await req.json();

    if (!date || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Date and records array are required' }, { status: 400 });
    }

    await connectToDatabase();

    const upsertOps = records.map((rec) => ({
      updateOne: {
        filter: { teacherId: rec.teacherId, date },
        update: {
          $set: {
            teacherId: rec.teacherId,
            date,
            status: rec.status || 'present',
            missedLectures: Array.isArray(rec.missedLectures) ? rec.missedLectures : [],
            remarks: rec.remarks || '',
            markedBy: session.user.id,
          },
        },
        upsert: true,
      },
    }));

    if (upsertOps.length > 0) {
      await TeacherAttendance.bulkWrite(upsertOps);
    }

    return NextResponse.json({
      success: true,
      message: `Teacher attendance for ${date} saved successfully!`,
      savedCount: upsertOps.length,
    });
  } catch (err) {
    console.error('Save teacher attendance error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
