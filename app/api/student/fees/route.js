import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Fee from '../../../../models/Fee';
import Student from '../../../../models/Student';
import { getServerAuthSession } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 403 });
    }

    const studentId = session.user.id;
    await connectToDatabase();

    const [student, fees] = await Promise.all([
      Student.findById(studentId).populate('classId', 'className section'),
      Fee.find({ studentId }).sort({ createdAt: -1 }),
    ]);

    return NextResponse.json({
      student,
      fees,
    });
  } catch (err) {
    console.error('Fetch student fees error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
