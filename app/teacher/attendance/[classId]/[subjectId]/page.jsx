'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
  Users,
  Clock,
  XCircle,
} from 'lucide-react';

export default function AttendanceMarkingPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId;
  const subjectId = params.subjectId;

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [classData, setClassData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    if (classId && subjectId) {
      loadAttendance();
    }
  }, [classId, subjectId, date]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setFeedback({ type: '', text: '' });
      const res = await fetch(
        `/api/teacher/attendance?classId=${classId}&subjectId=${subjectId}&date=${date}`
      );
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to load attendance roster' });
      } else {
        setClassData(data.classData);
        setSubjectData(data.subjectData);
        setStudents(data.students || []);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network error: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, status } : s))
    );
  };

  const markAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      const records = students.map((s) => ({
        studentId: s._id,
        status: s.status,
      }));

      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          subjectId,
          date,
          records,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to save attendance' });
      } else {
        setFeedback({
          type: 'success',
          text: data.message || 'Attendance records saved successfully!',
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'present').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/teacher/my-classes"
          className="text-slate-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Classes
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-emerald-600" />
              Mark Lecture Attendance
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Class: <strong className="text-slate-900">{classData?.className} - {classData?.section}</strong> • Subject: <strong className="text-sky-700">{subjectData?.subjectName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs text-slate-800 font-semibold focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {feedback.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Control bar & metrics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="text-slate-500 font-medium">Summary:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono">
            {presentCount} Present
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold font-mono">
            {lateCount} Late
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold font-mono">
            {absentCount} Absent
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => markAll('present')}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
          >
            All Present
          </button>
          <button
            type="button"
            onClick={() => markAll('absent')}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
            Loading class register...
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No students enrolled in this class cohort.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {students.map((student) => (
              <div
                key={student._id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 font-mono text-xs font-bold flex items-center justify-center border border-sky-100">
                    #{String(student.rollNumber).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{student.name}</h3>
                    <p className="text-[11px] text-slate-500">Section {student.section}</p>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student._id, 'present')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      student.status === 'present'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Present
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student._id, 'late')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      student.status === 'late'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Late
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student._id, 'absent')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      student.status === 'absent'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {students.length > 0 && (
        <button
          onClick={handleSaveAttendance}
          disabled={saving || loading}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Attendance Register ({date})
            </>
          )}
        </button>
      )}
    </div>
  );
}
