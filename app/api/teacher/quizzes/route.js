import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Quiz from '../../../../models/Quiz';
import QuizResult from '../../../../models/QuizResult';
import TeacherClass from '../../../../models/TeacherClass';
import Subject from '../../../../models/Subject';
import Student from '../../../../models/Student';
import { getServerAuthSession, checkTeacherOwnsClass } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'teacher' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
    let subjectIds = [];

    if (session.user.role === 'teacher') {
      const assignments = await TeacherClass.find({ teacherId: session.user.id });
      subjectIds = assignments.map((a) => a.subjectId);
    } else {
      const allSubjects = await Subject.find();
      subjectIds = allSubjects.map((s) => s._id);
    }

    const quizzes = await Quiz.find({ subjectId: { $in: subjectIds } })
      .populate({
        path: 'subjectId',
        select: 'subjectName classId',
        populate: { path: 'classId', select: 'className section' },
      })
      .sort({ createdAt: -1 });

    const quizzesWithCount = await Promise.all(
      quizzes.map(async (q) => {
        const resultCount = await QuizResult.countDocuments({ quizId: q._id });
        return {
          ...q.toObject(),
          resultCount,
        };
      })
    );

    return NextResponse.json({ quizzes: quizzesWithCount });
  } catch (err) {
    console.error('Fetch quizzes error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'teacher' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { subjectId, title, maxMarks, date } = await req.json();

    if (!subjectId || !title || !maxMarks) {
      return NextResponse.json({ error: 'subjectId, title, and maxMarks are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify teacher teaches this subject
    if (session.user.role === 'teacher') {
      const isAssigned = await TeacherClass.findOne({
        teacherId: session.user.id,
        subjectId,
      });
      if (!isAssigned) {
        return NextResponse.json(
          { error: 'Forbidden: You are not assigned to teach this subject.' },
          { status: 403 }
        );
      }
    }

    const quiz = await Quiz.create({
      subjectId,
      title: title.trim(),
      maxMarks: parseFloat(maxMarks),
      date: date || new Date().toISOString().split('T')[0],
    });

    return NextResponse.json({
      success: true,
      message: 'Quiz created successfully!',
      quiz,
    }, { status: 201 });
  } catch (err) {
    console.error('Create quiz error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
