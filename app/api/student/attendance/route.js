import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Subject from '@/models/Subject';
import { getServerAuthSession } from '@/lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 403 });
    }

    const studentId = session.user.id;
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    await connectToDatabase();
    const query = { studentId };
    if (subjectId) query.subjectId = subjectId;

    const attendanceRecords = await Attendance.find(query)
      .populate('subjectId', 'subjectName')
      .sort({ date: -1 });

    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((a) => a.status === 'present').length;
    const late = attendanceRecords.filter((a) => a.status === 'late').length;
    const absent = attendanceRecords.filter((a) => a.status === 'absent').length;

    const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

    return NextResponse.json({
      attendance: attendanceRecords,
      stats: {
        total,
        present,
        late,
        absent,
        percentage,
      },
    });
  } catch (err) {
    console.error('Fetch student attendance error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
