import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Student from '../../../../models/Student';
import Attendance from '../../../../models/Attendance';
import Grade from '../../../../models/Grade';
import Class from '../../../../models/Class';
import { getServerAuthSession } from '../../../../lib/permissions';
import { generatePerformanceInsightsAI } from '../../../../lib/ai';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized: Faculty or Admin session required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    await connectToDatabase();

    const studentQuery = {};
    let contextName = 'Academy-Wide Overview';

    if (classId) {
      studentQuery.classId = classId;
      const targetClass = await Class.findById(classId);
      if (targetClass) {
        contextName = `${targetClass.className} - Section ${targetClass.section}`;
      }
    }

    const students = await Student.find(studentQuery).select('name rollNumber email classId');
    const studentIds = students.map((s) => s._id);

    // Aggregate Attendance metrics
    const attendanceLogs = await Attendance.find({ studentId: { $in: studentIds } });
    const attendanceByStudent = new Map();

    attendanceLogs.forEach((att) => {
      const sId = att.studentId.toString();
      if (!attendanceByStudent.has(sId)) {
        attendanceByStudent.set(sId, { total: 0, present: 0 });
      }
      const record = attendanceByStudent.get(sId);
      record.total += 1;
      if (att.status === 'present') record.present += 1;
      else if (att.status === 'late') record.present += 0.5;
    });

    const lowAttendanceStudents = [];
    let totalPctSum = 0;
    let countedStudents = 0;

    students.forEach((s) => {
      const rec = attendanceByStudent.get(s._id.toString());
      if (rec && rec.total > 0) {
        const pct = Math.round((rec.present / rec.total) * 100);
        totalPctSum += pct;
        countedStudents += 1;
        if (pct < 75) {
          lowAttendanceStudents.push({ name: s.name, attendancePercent: `${pct}%`, absences: rec.total - rec.present });
        }
      }
    });

    const attendanceAverage = countedStudents > 0 ? Math.round(totalPctSum / countedStudents) : 92;

    // Aggregate Grades metrics
    const grades = await Grade.find({ studentId: { $in: studentIds } });
    const gradesByStudent = new Map();

    grades.forEach((g) => {
      const sId = g.studentId.toString();
      if (!gradesByStudent.has(sId)) {
        gradesByStudent.set(sId, { totalMarks: 0, totalMax: 0 });
      }
      const rec = gradesByStudent.get(sId);
      rec.totalMarks += g.marks;
      rec.totalMax += g.totalMarks || 100;
    });

    const lowGradingStudents = [];
    const topPerformers = [];

    students.forEach((s) => {
      const rec = gradesByStudent.get(s._id.toString());
      if (rec && rec.totalMax > 0) {
        const pct = Math.round((rec.totalMarks / rec.totalMax) * 100);
        if (pct < 50) {
          lowGradingStudents.push({ name: s.name, average: `${pct}%` });
        } else if (pct >= 85) {
          topPerformers.push({ name: s.name, average: `${pct}%` });
        }
      }
    });

    // Generate Insights via OpenAI gpt-4o-mini
    const { insights, generatedBy } = await generatePerformanceInsightsAI({
      contextName,
      totalStudents: students.length,
      attendanceAverage,
      lowAttendanceStudents,
      lowGradingStudents,
      topPerformers,
    });

    return NextResponse.json({
      contextName,
      totalStudents: students.length,
      attendanceAverage,
      lowAttendanceCount: lowAttendanceStudents.length,
      lowGradeCount: lowGradingStudents.length,
      topPerformersCount: topPerformers.length,
      insights,
      generatedBy,
    });
  } catch (err) {
    console.error('AI Insights error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
