import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import User from '../../../../models/User';
import TeacherClass from '../../../../models/TeacherClass';
import { getServerAuthSession } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query = { role: 'teacher' };
    if (status) {
      query.status = status;
    }

    const teachers = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Fetch assignment counts for active teachers
    const teachersWithAssignments = await Promise.all(
      teachers.map(async (t) => {
        const assignments = await TeacherClass.find({ teacherId: t._id })
          .populate('classId', 'className section')
          .populate('subjectId', 'subjectName');
        return {
          ...t.toObject(),
          assignments,
        };
      })
    );

    return NextResponse.json({ teachers: teachersWithAssignments });
  } catch (err) {
    console.error('Fetch teachers error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
