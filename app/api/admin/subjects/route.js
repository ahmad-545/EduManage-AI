import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Subject from '../../../../models/Subject';
import TeacherClass from '../../../../models/TeacherClass';
import { getServerAuthSession } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    await connectToDatabase();
    const query = {};
    if (classId) query.classId = classId;

    const subjects = await Subject.find(query).populate('classId', 'className section').sort({ subjectName: 1 });
    return NextResponse.json({ subjects });
  } catch (err) {
    console.error('Fetch subjects error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { classId, subjectName } = await req.json();
    if (!classId || !subjectName) {
      return NextResponse.json({ error: 'Class and Subject Name are required' }, { status: 400 });
    }

    await connectToDatabase();
    const cleanName = subjectName.trim();

    const existing = await Subject.findOne({ classId, subjectName: cleanName });
    if (existing) {
      return NextResponse.json(
        { error: `Subject "${cleanName}" already exists for this class` },
        { status: 409 }
      );
    }

    const newSubject = await Subject.create({
      classId,
      subjectName: cleanName,
    });

    return NextResponse.json(
      { success: true, message: 'Subject created successfully!', subject: newSubject },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create subject error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Subject id is required' }, { status: 400 });
    }

    await connectToDatabase();
    await TeacherClass.deleteMany({ subjectId: id });
    await Subject.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Subject deleted successfully.' });
  } catch (err) {
    console.error('Delete subject error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
