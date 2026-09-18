import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Attendance from '../../../../models/Attendance';
import Student from '../../../../models/Student';
import Class from '../../../../models/Class';
import Subject from '../../../../models/Subject';
import { getServerAuthSession, checkTeacherOwnsClass } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'teacher' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!classId || !subjectId) {
      return NextResponse.json({ error: 'classId and subjectId are required' }, { status: 400 });
    }

    // Role check: If teacher, verify ownership
    if (session.user.role === 'teacher') {
      const owns = await checkTeacherOwnsClass(session.user.id, classId, subjectId);
      if (!owns) {
        return NextResponse.json(
          { error: 'Forbidden: You are not assigned to teach this class and subject.' },
          { status: 403 }
        );
      }
    }

    await connectToDatabase();

    const [classData, subjectData, students, existingAttendance] = await Promise.all([
      Class.findById(classId),
      Subject.findById(subjectId),
      Student.find({ classId }).select('name rollNumber email section').sort({ rollNumber: 1 }),
      Attendance.find({ subjectId, date }),
    ]);

    const attendanceMap = new Map();
    existingAttendance.forEach((att) => {
      attendanceMap.set(att.studentId.toString(), att.status);
    });

    const studentRoster = students.map((s) => ({
      _id: s._id,
      name: s.name,
      rollNumber: s.rollNumber,
      section: s.section,
      status: attendanceMap.get(s._id.toString()) || 'present', // Default to present
    }));

    return NextResponse.json({
      classData,
      subjectData,
      date,
      students: studentRoster,
    });
  } catch (err) {
    console.error('Fetch attendance error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'teacher' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { classId, subjectId, date, records } = await req.json();

    if (!classId || !subjectId || !date || !Array.isArray(records)) {
      return NextResponse.json({ error: 'classId, subjectId, date, and records array required' }, { status: 400 });
    }

    // Strict Ownership Enforcement: Must check TeacherClass
    if (session.user.role === 'teacher') {
      const owns = await checkTeacherOwnsClass(session.user.id, classId, subjectId);
      if (!owns) {
        return NextResponse.json(
          { error: 'Forbidden: You are not authorized to mark attendance for this class/subject.' },
          { status: 403 }
        );
      }
    }

    await connectToDatabase();

    // Upsert attendance for each student
    const updatePromises = records.map(async (rec) => {
      return Attendance.findOneAndUpdate(
        { studentId: rec.studentId, subjectId, date },
        { status: rec.status },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Attendance for ${records.length} students recorded successfully for ${date}!`,
    });
  } catch (err) {
    console.error('Save attendance error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
