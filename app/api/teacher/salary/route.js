import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import TeacherSalary from '@/models/TeacherSalary';
import { getServerAuthSession } from '@/lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'teacher' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized: Teacher session required' }, { status: 403 });
    }

    const teacherId = session.user.id;
    const now = new Date();
    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now);

    await connectToDatabase();

    const currentRecord = await TeacherSalary.findOne({ teacherId, month: currentMonth });
    const history = await TeacherSalary.find({ teacherId }).sort({ createdAt: -1 });

    return NextResponse.json({
      currentMonth,
      currentSalary: currentRecord || {
        month: currentMonth,
        baseSalary: 50000,
        deductions: 0,
        bonus: 0,
        netSalary: 50000,
        status: 'pending',
      },
      history,
    });
  } catch (err) {
    console.error('Fetch teacher salary error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
