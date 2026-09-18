'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Download, ArrowLeft, CalendarCheck } from 'lucide-react';
import { generateResultCardPDF } from '../../../lib/pdfGenerator';

export default function StudentGradesPage() {
  const [student, setStudent] = useState(null);
  const [gradeBook, setGradeBook] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/grades');
      const data = await res.json();
      setStudent(data.student);
      setGradeBook(data.gradeBook || []);
    } catch (err) {
      console.error('Failed to load grades:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/student/dashboard"
            className="text-slate-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-sky-600" />
            Official Academic Grade Book
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Subject performance transcript, quiz metrics, period attendance records, and composite grades.
          </p>
        </div>

        {gradeBook.length > 0 && (
          <button
            onClick={() => generateResultCardPDF({ student, gradeBook })}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center gap-2 self-start md:self-auto"
          >
            <Download className="w-4 h-4" />
            Download Result Card PDF
          </button>
        )}
      </div>

      {/* Grade Book Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-sky-50/50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Academic Term Evaluation • {student?.classId?.className} - Section {student?.section}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Roll #{student?.rollNumber} • {student?.name}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Quiz Average</th>
                <th className="py-3 px-4">Exam Marks Breakdown</th>
                <th className="py-3 px-4 text-center">Composite Grade</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-2" />
                    Loading academic gradebook...
                  </td>
                </tr>
              ) : gradeBook.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No academic records logged yet.
                  </td>
                </tr>
              ) : (
                gradeBook.map((row) => (
                  <tr key={row.subjectName} className="hover:bg-sky-50/30 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {row.subjectName}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {row.attendancePercent}%
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-800 font-semibold">
                      {typeof row.quizAverage === 'number' ? `${row.quizAverage}%` : row.quizAverage}
                    </td>
                    <td className="py-4 px-4">
                      {row.exams && row.exams.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {row.exams.map((ex, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-mono font-medium"
                            >
                              {ex.examType}: {ex.marks}/{ex.totalMarks}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No exams recorded</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                          row.finalGrade === 'A+' || row.finalGrade === 'A'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : row.finalGrade === 'B'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {row.finalGrade}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
