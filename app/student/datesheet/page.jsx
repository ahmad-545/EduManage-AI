'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Calendar,
  Clock,
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function StudentDatesheetPage() {
  const [data, setData] = useState({ student: null, subjects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/my-data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load datesheet:', err);
    } finally {
      setLoading(false);
    }
  };

  const student = data.student;
  const subjects = data.subjects || [];

  // Generate examination dates starting from next Monday
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + ((1 + 7 - baseDate.getDay()) % 7 || 7));

  const examDatesheet = subjects.map((subj, index) => {
    const examDate = new Date(baseDate);
    examDate.setDate(baseDate.getDate() + index * 2); // Every 2 days
    const dateString = examDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const dayString = examDate.toLocaleDateString('en-GB', { weekday: 'long' });

    return {
      id: subj.subjectId,
      subjectName: subj.subjectName,
      date: dateString,
      day: dayString,
      time: '09:00 AM - 12:00 PM',
      room: `Hall ${String.fromCharCode(65 + (index % 3))} (Desk #${student?.rollNumber || 1})`,
      maxMarks: 100,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/student/dashboard"
          className="text-slate-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-sky-600" />
              Examination Datesheet & Schedule
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Official Examination Timetable for {student?.classId?.className} (Section {student?.section})
            </p>
          </div>

          <Link
            href="/student/roll-number-slip"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
          >
            <FileText className="w-4 h-4" />
            Download Roll Number Slip
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          Loading examination timetable...
        </div>
      ) : examDatesheet.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs">
          No examination schedule published for your class yet.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-sky-50/50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Term Examination Schedule 2026
                </h3>
                <p className="text-xs text-slate-500">
                  Reporting Time: 08:30 AM (Paper starts promptly at 09:00 AM)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 font-mono">
                Roll #{String(student?.rollNumber).padStart(3, '0')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Exam Date</th>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Allocated Hall / Desk</th>
                    <th className="py-3 px-4 text-right">Max Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examDatesheet.map((exam) => (
                    <tr key={exam.id} className="hover:bg-sky-50/30 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {exam.subjectName}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-sky-700">
                        {exam.date}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {exam.day}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {exam.time}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-medium">
                          {exam.room}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {exam.maxMarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Guidelines alert */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-sky-950">
              <AlertCircle className="w-4 h-4 text-sky-600" />
              Examination Instructions:
            </h4>
            <ul className="list-disc list-inside space-y-0.5 text-sky-800 text-[11px] pl-1">
              <li>Candidates must bring their original printed <strong>Roll Number Slip</strong> and institutional ID card.</li>
              <li>Mobile phones, smartwatches, and unauthorized materials are strictly prohibited in the exam hall.</li>
              <li>Entry is closed 15 minutes after examination begins.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
