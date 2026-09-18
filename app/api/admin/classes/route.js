import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Class from '../../../../models/Class';
import Subject from '../../../../models/Subject';
import Student from '../../../../models/Student';
import { getServerAuthSession } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();
    const classes = await Class.find().sort({ className: 1, section: 1 });

    const classesWithDetails = await Promise.all(
      classes.map(async (c) => {
        const studentCount = await Student.countDocuments({ classId: c._id });
        const subjects = await Subject.find({ classId: c._id });
        return {
          ...c.toObject(),
          studentCount,
          subjects,
        };
      })
    );

    return NextResponse.json({ classes: classesWithDetails });
  } catch (err) {
    console.error('Fetch classes error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { className, section } = await req.json();
    if (!className || !section) {
      return NextResponse.json({ error: 'Class Name and Section are required' }, { status: 400 });
    }

    await connectToDatabase();
    const cleanName = className.trim();
    const cleanSection = section.toUpperCase().trim();

    const existing = await Class.findOne({ className: cleanName, section: cleanSection });
    if (existing) {
      return NextResponse.json(
        { error: `${cleanName} - Section ${cleanSection} already exists` },
        { status: 409 }
      );
    }

    const newClass = await Class.create({
      className: cleanName,
      section: cleanSection,
    });

    return NextResponse.json(
      { success: true, message: 'Class created successfully!', class: newClass },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create class error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
