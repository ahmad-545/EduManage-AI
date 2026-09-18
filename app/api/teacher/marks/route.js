import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Grade from '../../../../models/Grade';
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
    const examType = searchParams.get('examType') || 'Midterm Examination';

    if (!classId || !subjectId) {
      return NextResponse.json({ error: 'classId and subjectId are required' }, { status: 400 });
    }

    // Role check: If teacher, verify ownership
    if (session.user.role === 'teacher') {
      const owns = await checkTeacherOwnsClass(session.user.id, classId, subjectId);
      if (!owns) {
        return NextResponse.json(
          { error: 'Forbidden: You are not assigned to this class and subject.' },
          { status: 403 }
        );
      }
    }

    await connectToDatabase();

    const [classData, subjectData, students, existingGrades] = await Promise.all([
      Class.findById(classId),
      Subject.findById(subjectId),
      Student.find({ classId }).select('name rollNumber section').sort({ rollNumber: 1 }),
      Grade.find({ subjectId, examType }),
    ]);

    const gradeMap = new Map();
    let totalMarksRecorded = 100;
    existingGrades.forEach((g) => {
      gradeMap.set(g.studentId.toString(), g.marks);
      if (g.totalMarks) totalMarksRecorded = g.totalMarks;
    });

    const studentRoster = students.map((s) => ({
      _id: s._id,
      name: s.name,
      rollNumber: s.rollNumber,
      section: s.section,
      marks: gradeMap.has(s._id.toString()) ? gradeMap.get(s._id.toString()) : '',
    }));

    return NextResponse.json({
      classData,
      subjectData,
      examType,
      totalMarks: totalMarksRecorded,
      students: studentRoster,
    });
  } catch (err) {
    console.error('Fetch marks error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'teacher' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { classId, subjectId, examType, totalMarks, marksList } = await req.json();

    if (!classId || !subjectId || !examType || !Array.isArray(marksList)) {
      return NextResponse.json({ error: 'classId, subjectId, examType, and marksList are required' }, { status: 400 });
    }

    // Role check: If teacher, verify ownership
    if (session.user.role === 'teacher') {
      const owns = await checkTeacherOwnsClass(session.user.id, classId, subjectId);
      if (!owns) {
        return NextResponse.json(
          { error: 'Forbidden: You are not authorized to enter grades for this class/subject.' },
          { status: 403 }
        );
      }
    }

    await connectToDatabase();

    const parsedTotal = totalMarks ? parseFloat(totalMarks) : 100;

    const savePromises = marksList.map(async (item) => {
      if (item.marks !== '' && item.marks !== null && !isNaN(item.marks)) {
        return Grade.findOneAndUpdate(
          { studentId: item.studentId, subjectId, examType },
          { marks: parseFloat(item.marks), totalMarks: parsedTotal },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    });

    await Promise.all(savePromises);

    return NextResponse.json({
      success: true,
      message: `Marks for ${examType} saved successfully!`,
    });
  } catch (err) {
    console.error('Save marks error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
