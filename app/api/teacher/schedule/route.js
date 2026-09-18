import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import TeacherClass from '../../../../models/TeacherClass';
import Schedule from '../../../../models/Schedule';
import { getServerAuthSession } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'teacher' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const teacherId = session.user.id;
    await connectToDatabase();

    const assignments = await TeacherClass.find({ teacherId })
      .populate('classId', 'className section')
      .populate('subjectId', 'subjectName');

    const assignmentIds = assignments.map((a) => a._id);
    let scheduleSlots = await Schedule.find({ teacherClassId: { $in: assignmentIds } })
      .populate({
        path: 'teacherClassId',
        populate: [
          { path: 'classId', select: 'className section' },
          { path: 'subjectId', select: 'subjectName' },
        ],
      })
      .sort({ day: 1, timeSlot: 1 });

    // Fallback: If no explicit schedule slots exist in DB, synthesize weekly timetable slots
    if (scheduleSlots.length === 0 && assignments.length > 0) {
      const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const standardSlots = [
        { timeSlot: '09:00 AM - 10:15 AM', room: 'Room 6212' },
        { timeSlot: '10:30 AM - 11:45 AM', room: 'Room 6205' },
        { timeSlot: '12:00 PM - 01:15 PM', room: 'Room 6212' },
        { timeSlot: '01:30 PM - 02:45 PM', room: 'Room 6108' },
      ];

      const synthesized = [];
      defaultDays.forEach((day, dayIdx) => {
        const count = Math.min(assignments.length, dayIdx % 2 === 0 ? 3 : 2);
        for (let i = 0; i < count; i++) {
          const assign = assignments[(dayIdx + i) % assignments.length];
          synthesized.push({
            _id: `synth-t-${day}-${i}`,
            day,
            timeSlot: standardSlots[i % standardSlots.length].timeSlot,
            room: standardSlots[i % standardSlots.length].room,
            teacherClassId: assign,
          });
        }
      });
      scheduleSlots = synthesized;
    }

    return NextResponse.json({
      schedule: scheduleSlots,
      teacher: {
        name: session.user.name,
        email: session.user.email,
      },
    });
  } catch (err) {
    console.error('Fetch teacher schedule error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
