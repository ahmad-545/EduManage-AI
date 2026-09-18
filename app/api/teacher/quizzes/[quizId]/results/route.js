import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import QuizResult from '@/models/QuizResult';
import Subject from '@/models/Subject';
import Student from '@/models/Student';
import TeacherClass from '@/models/TeacherClass';
import { getServerAuthSession } from '@/lib/permissions';

export async function GET(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'teacher' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { quizId } = await params;
    await connectToDatabase();

    const quiz = await Quiz.findById(quizId).populate({
      path: 'subjectId',
      populate: { path: 'classId' },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Role check
    if (session.user.role === 'teacher') {
      const isAssigned = await TeacherClass.findOne({
        teacherId: session.user.id,
        subjectId: quiz.subjectId._id,
      });
      if (!isAssigned) {
        return NextResponse.json({ error: 'Forbidden: You do not teach this subject' }, { status: 403 });
      }
    }

    const classId = quiz.subjectId.classId._id;
    const students = await Student.find({ classId }).select('name rollNumber section').sort({ rollNumber: 1 });
    const existingResults = await QuizResult.find({ quizId });

    const marksMap = new Map();
    existingResults.forEach((r) => marksMap.set(r.studentId.toString(), r.marksObtained));

    const roster = students.map((s) => ({
      _id: s._id,
      name: s.name,
      rollNumber: s.rollNumber,
      section: s.section,
      marksObtained: marksMap.has(s._id.toString()) ? marksMap.get(s._id.toString()) : '',
    }));

    return NextResponse.json({
      quiz,
      students: roster,
    });
  } catch (err) {
    console.error('Fetch quiz results error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'teacher' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { quizId } = await params;
    const { results } = await req.json(); // [{ studentId, marksObtained }]

    if (!Array.isArray(results)) {
      return NextResponse.json({ error: 'Results array required' }, { status: 400 });
    }

    await connectToDatabase();
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Role check
    if (session.user.role === 'teacher') {
      const isAssigned = await TeacherClass.findOne({
        teacherId: session.user.id,
        subjectId: quiz.subjectId,
      });
      if (!isAssigned) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const savePromises = results.map(async (item) => {
      if (item.marksObtained !== '' && item.marksObtained !== null && !isNaN(item.marksObtained)) {
        return QuizResult.findOneAndUpdate(
          { quizId, studentId: item.studentId },
          { marksObtained: parseFloat(item.marksObtained) },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    });

    await Promise.all(savePromises);

    return NextResponse.json({
      success: true,
      message: 'Quiz results updated successfully!',
    });
  } catch (err) {
    console.error('Save quiz results error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
