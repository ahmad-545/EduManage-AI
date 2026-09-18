'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ClipboardList,
  Save,
  CheckCircle2,
  AlertCircle,
  Award,
  Hash,
} from 'lucide-react';

export default function MarksEntryPage() {
  const params = useParams();
  const classId = params.classId;
  const subjectId = params.subjectId;

  const [examType, setExamType] = useState('Midterm Examination');
  const [totalMarks, setTotalMarks] = useState(100);
  const [classData, setClassData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    if (classId && subjectId) {
      loadMarks();
    }
  }, [classId, subjectId, examType]);

  const loadMarks = async () => {
    try {
      setLoading(true);
      setFeedback({ type: '', text: '' });

      const res = await fetch(
        `/api/teacher/marks?classId=${classId}&subjectId=${subjectId}&examType=${encodeURIComponent(
          examType
        )}`
      );
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to load marks' });
      } else {
        setClassData(data.classData);
        setSubjectData(data.subjectData);
        setTotalMarks(data.totalMarks || 100);
        setStudents(data.students || []);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network error: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, val) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, marks: val } : s))
    );
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      const marksList = students.map((s) => ({
        studentId: s._id,
        marks: s.marks,
      }));

      const res = await fetch('/api/teacher/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          subjectId,
          examType,
          totalMarks,
          marksList,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to save marks' });
      } else {
        setFeedback({ type: 'success', text: data.message || 'Marks saved successfully!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

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
              <ClipboardList className="w-6 h-6 text-sky-600" />
              Examination Marks & Grades Entry
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Class: <strong className="text-slate-900">{classData?.className} - {classData?.section}</strong> • Subject: <strong className="text-sky-700">{subjectData?.subjectName}</strong>
            </p>
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

      {/* Exam selection configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Assessment / Examination Type
          </label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          >
            <option value="Midterm Examination">Midterm Examination</option>
            <option value="Final Examination">Final Examination</option>
            <option value="Monthly Test 1">Monthly Test 1</option>
            <option value="Monthly Test 2">Monthly Test 2</option>
            <option value="Coursework & Assignment">Coursework & Assignment</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Total Maximum Marks
          </label>
          <input
            type="number"
            min="1"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Roster Marks Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
            Loading student roster and existing scores...
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No students enrolled in this class cohort.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {students.map((student) => {
              const numericMarks = parseFloat(student.marks);
              const percentage = !isNaN(numericMarks) && totalMarks > 0
                ? Math.round((numericMarks / totalMarks) * 100)
                : null;

              return (
                <div
                  key={student._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-700 font-mono text-xs font-bold flex items-center justify-center">
                      #{String(student.rollNumber).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{student.name}</h3>
                      <p className="text-[11px] text-slate-500">Section {student.section}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {percentage !== null && (
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                          percentage >= 80
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : percentage >= 50
                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {percentage}%
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max={totalMarks}
                        value={student.marks}
                        onChange={(e) => handleMarksChange(student._id, e.target.value)}
                        placeholder="Marks"
                        className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 text-center font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                      />
                      <span className="text-xs text-slate-500 font-mono">/ {totalMarks}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {students.length > 0 && (
        <button
          onClick={handleSaveMarks}
          disabled={saving || loading}
          className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save {examType} Marks
            </>
          )}
        </button>
      )}
    </div>
  );
}
