'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  User,
  CalendarCheck,
  Award,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function StudentSubjectDetailPage() {
  const params = useParams();
  const subjectId = params.subjectId;

  const [subjectData, setSubjectData] = useState(null);
  const [attendance, setAttendance] = useState({ records: [], stats: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subjectId) {
      loadSubjectDetail();
    }
  }, [subjectId]);

  const loadSubjectDetail = async () => {
    try {
      setLoading(true);
      const [myDataRes, attRes] = await Promise.all([
        fetch('/api/student/my-data'),
        fetch(`/api/student/attendance?subjectId=${subjectId}`),
      ]);

      const myData = await myDataRes.json();
      const attData = await attRes.json();

      const matchedSub = (myData.subjects || []).find(
        (s) => s.subjectId?.toString() === subjectId?.toString()
      );

      setSubjectData(matchedSub);
      setAttendance({
        records: attData.attendance || [],
        stats: attData.stats,
      });
    } catch (err) {
      console.error('Failed to load subject detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs">
        <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
        Loading course analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/student/dashboard"
          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-sky-400" />
              {subjectData?.subjectName || 'Subject Overview'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-sky-400" />
              Instructor: <strong className="text-white">{subjectData?.teacherName || 'Faculty Member'}</strong>
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl text-xs font-bold font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30 self-start sm:self-auto">
            Grade: {subjectData?.currentGrade || 'In Progress'}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Period Attendance</span>
          <p className="text-2xl font-bold text-teal-400 font-mono mt-1">
            {subjectData?.attendancePercent}%
          </p>
          <span className="text-[11px] text-slate-500">
            {attendance.stats?.present || 0} Present • {attendance.stats?.late || 0} Late
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Quiz Average</span>
          <p className="text-2xl font-bold text-indigo-300 font-mono mt-1">
            {subjectData?.quizAveragePercent !== null ? `${subjectData.quizAveragePercent}%` : 'N/A'}
          </p>
          <span className="text-[11px] text-slate-500">Across pop tests</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Latest Examination</span>
          <p className="text-base font-bold text-white font-mono mt-1 truncate">
            {subjectData?.latestExamMarks || 'Pending'}
          </p>
          <span className="text-[11px] text-slate-500">Formal assessment</span>
        </div>
      </div>

      {/* Date-by-date Attendance Log */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-teal-400" />
            Class Lecture Attendance History
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            {attendance.records.length} Recorded Lecture(s)
          </span>
        </div>

        {attendance.records.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No lecture attendance marked yet for this subject.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {attendance.records.map((rec) => (
              <div
                key={rec._id}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-800/30 transition text-xs"
              >
                <span className="font-mono text-slate-300">{rec.date}</span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                    rec.status === 'present'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : rec.status === 'late'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
