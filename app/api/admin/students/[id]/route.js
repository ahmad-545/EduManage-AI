import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import Grade from '@/models/Grade';
import QuizResult from '@/models/QuizResult';
import Fee from '@/models/Fee';
import { getServerAuthSession } from '@/lib/permissions';

export async function GET(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Student profile access is Super Admin only.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const student = await Student.findById(id).populate('classId', 'className section').select('-password');
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (err) {
    console.error('Fetch student by id error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerAuthSession();

    // Critical Business Rule: Teachers CANNOT edit student profile data — Super Admin only
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Teachers cannot modify student profile data. Super Admin permissions required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { name, parentPhone, classId, section, rollNumber, password } = await req.json();

    await connectToDatabase();
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (name) student.name = name.trim();
    if (parentPhone) student.parentPhone = parentPhone.trim();
    if (classId) student.classId = classId;
    if (section) student.section = section.toUpperCase().trim();
    if (rollNumber) student.rollNumber = parseInt(rollNumber, 10);
    if (password && password.trim().length >= 4) {
      const bcrypt = (await import('bcryptjs')).default;
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password.trim(), salt);
    }

    await student.save();

    return NextResponse.json({
      success: true,
      message: 'Student profile updated successfully!',
      student,
    });
  } catch (err) {
    console.error('Update student error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerAuthSession();

    // Critical Business Rule: Only Super Admin can delete student records
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Super Admin permissions required to delete student records.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Cascade delete related records
    await Attendance.deleteMany({ studentId: id });
    await Grade.deleteMany({ studentId: id });
    await QuizResult.deleteMany({ studentId: id });
    await Fee.deleteMany({ studentId: id });
    await Student.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Student ${student.name} and associated academic records have been removed.`,
    });
  } catch (err) {
    console.error('Delete student error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
