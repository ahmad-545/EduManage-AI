import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/mongodb';
import Student from '../../../../models/Student';
import { getServerAuthSession } from '../../../../lib/permissions';

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const student = await Student.findById(session.user.id);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, student.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Current password is incorrect. Please enter your existing password correctly.' },
          { status: 400 }
        );
      }
    }

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(newPassword, salt);
    student.mustChangePassword = false;
    await student.save();

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully! You can now access your student portal.',
    });
  } catch (err) {
    console.error('Password change error:', err);
    return NextResponse.json(
      { error: 'Failed to update password: ' + err.message },
      { status: 500 }
    );
  }
}
