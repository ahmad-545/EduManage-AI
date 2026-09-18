import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import TeacherClass from '@/models/TeacherClass';
import Schedule from '@/models/Schedule';
import Class from '@/models/Class';
import Subject from '@/models/Subject';
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

    const assignments = await TeacherClass.find({ teacherId: id })
      .populate('classId', 'className section')
      .populate('subjectId', 'subjectName');

    const assignmentsWithSchedule = await Promise.all(
      assignments.map(async (tc) => {
        const slots = await Schedule.find({ teacherClassId: tc._id });
        return {
          ...tc.toObject(),
          schedule: slots,
        };
      })
    );

    return NextResponse.json({
      teacher,
      assignments: assignmentsWithSchedule,
    });
  } catch (err) {
    console.error('Fetch teacher assignments error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id } = await params;
    const { classId, className, section, subjectId, subjectName, scheduleSlots } = await req.json();

    if ((!classId && !className) || (!subjectId && !subjectName)) {
      return NextResponse.json({ error: 'Class Name and Subject Name are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify teacher
    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== 'teacher') {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Resolve or auto-create Class
    let targetClass = null;
    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      targetClass = await Class.findById(classId);
    }
    if (!targetClass && className) {
      const normalizedName = className.trim();
      const normalizedSection = (section || 'A').trim().toUpperCase();
      targetClass = await Class.findOne({
        className: new RegExp(`^${normalizedName}$`, 'i'),
        section: normalizedSection,
      });
      if (!targetClass) {
        targetClass = await Class.create({
          className: normalizedName,
          section: normalizedSection,
        });
      }
    }
    if (!targetClass) {
      return NextResponse.json({ error: 'Valid Class or Class Name is required' }, { status: 400 });
    }

    // Resolve or auto-create Subject
    let targetSubject = null;
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      targetSubject = await Subject.findById(subjectId);
    }
    if (!targetSubject && subjectName) {
      const normSubjectName = subjectName.trim();
      targetSubject = await Subject.findOne({
        classId: targetClass._id,
        subjectName: new RegExp(`^${normSubjectName}$`, 'i'),
      });
      if (!targetSubject) {
        targetSubject = await Subject.create({
          classId: targetClass._id,
          subjectName: normSubjectName,
        });
      }
    }
    if (!targetSubject) {
      return NextResponse.json({ error: 'Valid Subject or Subject Name is required' }, { status: 400 });
    }

    // Check if assignment already exists
    let teacherClass = await TeacherClass.findOne({
      teacherId: id,
      classId: targetClass._id,
      subjectId: targetSubject._id,
    });

    if (!teacherClass) {
      teacherClass = await TeacherClass.create({
        teacherId: id,
        classId: targetClass._id,
        subjectId: targetSubject._id,
      });
    }

    // Create schedule slots if provided
    if (Array.isArray(scheduleSlots) && scheduleSlots.length > 0) {
      for (const slot of scheduleSlots) {
        if (slot.day && slot.timeSlot) {
          await Schedule.create({
            teacherClassId: teacherClass._id,
            day: slot.day,
            timeSlot: slot.timeSlot,
            room: slot.room || 'Room 101',
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher assigned to class and subject successfully!',
      assignmentId: teacherClass._id,
    }, { status: 201 });
  } catch (err) {
    console.error('Assign teacher error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId query param is required' }, { status: 400 });
    }

    await connectToDatabase();
    await Schedule.deleteMany({ teacherClassId: assignmentId });
    await TeacherClass.findByIdAndDelete(assignmentId);

    return NextResponse.json({ success: true, message: 'Assignment removed.' });
  } catch (err) {
    console.error('Delete assignment error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
