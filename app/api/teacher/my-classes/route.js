import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import TeacherClass from '../../../../models/TeacherClass';
import Student from '../../../../models/Student';
import { getServerAuthSession } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'teacher' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized: Educator session required' }, { status: 403 });
    }

    const teacherId = session.user.id;
    await connectToDatabase();

    // Fetch assignments for this teacher only
    const assignments = await TeacherClass.find({ teacherId })
      .populate('classId', 'className section')
      .populate('subjectId', 'subjectName');

    // Fetch schedules for all assignments
    const Schedule = (await import('../../../../models/Schedule')).default;
    const assignmentIds = assignments.map((a) => a._id);
    const allSchedules = await Schedule.find({ teacherClassId: { $in: assignmentIds } });

    // Extract unique classes
    const classMap = new Map();
    const assignedSubjects = [];

    for (const a of assignments) {
      if (a.classId) {
        const cId = a.classId._id.toString();
        if (!classMap.has(cId)) {
          classMap.set(cId, a.classId);
        }
        if (a.subjectId) {
          const slots = allSchedules.filter(
            (s) => s.teacherClassId.toString() === a._id.toString()
          );
          assignedSubjects.push({
            classId: cId,
            className: `${a.classId.className} - Section ${a.classId.section}`,
            rawClassName: a.classId.className,
            section: a.classId.section,
            subjectId: a.subjectId._id.toString(),
            subjectName: a.subjectId.subjectName,
            assignmentId: a._id.toString(),
            schedule: slots,
          });
        }
      }
    }

    const classes = Array.from(classMap.values());
    const classIds = classes.map((c) => c._id);

    // Fetch only students enrolled in this teacher's assigned classes
    const students = await Student.find({ classId: { $in: classIds } })
      .populate('classId', 'className section')
      .select('-password')
      .sort({ classId: 1, rollNumber: 1 });

    return NextResponse.json({
      classes,
      assignedSubjects,
      students,
    });
  } catch (err) {
    console.error('Fetch teacher classes error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
