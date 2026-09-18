import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerAuthSession } from '@/lib/permissions';

export async function POST(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id } = await params;
    const { action } = await req.json(); // 'approve' | 'reject'

    await connectToDatabase();
    const teacher = await User.findById(id);

    if (!teacher || teacher.role !== 'teacher') {
      return NextResponse.json({ error: 'Teacher record not found' }, { status: 404 });
    }

    if (action === 'approve') {
      teacher.status = 'active';
      await teacher.save();
      return NextResponse.json({
        success: true,
        message: `Teacher ${teacher.name} has been approved and activated!`,
        teacher,
      });
    } else if (action === 'reject') {
      await User.findByIdAndDelete(id);
      return NextResponse.json({
        success: true,
        message: `Teacher application for ${teacher.name} has been rejected.`,
      });
    } else {
      return NextResponse.json({ error: 'Invalid action. Expected "approve" or "reject".' }, { status: 400 });
    }
  } catch (err) {
    console.error('Teacher approval error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
