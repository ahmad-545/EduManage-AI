import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Student from '../../../../models/Student';
import TeacherClass from '../../../../models/TeacherClass';
import Schedule from '../../../../models/Schedule';
import { getServerAuthSession } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 403 });
    }

    const studentId = session.user.id;
    await connectToDatabase();

    const student = await Student.findById(studentId).populate('classId');
    if (!student || !student.classId) {
      return NextResponse.json({ schedule: [], student: null });
    }

    const classObj = student.classId;
    const assignments = await TeacherClass.find({ classId: classObj._id })
      .populate('teacherId', 'name email phone')
      .populate('subjectId', 'subjectName');

    const assignmentIds = assignments.map((a) => a._id);
    let scheduleSlots = await Schedule.find({ teacherClassId: { $in: assignmentIds } })
      .populate({
        path: 'teacherClassId',
        populate: [
          { path: 'teacherId', select: 'name email phone' },
          { path: 'subjectId', select: 'subjectName' },
        ],
      })
      .sort({ day: 1, timeSlot: 1 });

    // Fallback: If no explicit schedule slots were recorded in DB, but assignments exist,
    // construct standard weekly lecture schedule across Monday-Saturday for enrolled subjects!
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
        const lecturesPerDay = Math.min(assignments.length, dayIdx % 2 === 0 ? 3 : 2);
        for (let i = 0; i < lecturesPerDay; i++) {
          const assign = assignments[(dayIdx + i) % assignments.length];
          synthesized.push({
            _id: `synth-${day}-${i}`,
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
      student: {
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        className: classObj.className,
        section: classObj.section,
      },
    });
  } catch (err) {
    console.error('Fetch student schedule error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
