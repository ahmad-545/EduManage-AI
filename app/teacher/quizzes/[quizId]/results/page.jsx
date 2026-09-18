'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';

export default function QuizResultsPage() {
  const params = useParams();
  const quizId = params.quizId;

  const [quiz, setQuiz] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    if (quizId) {
      loadQuizResults();
    }
  }, [quizId]);

  const loadQuizResults = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teacher/quizzes/${quizId}/results`);
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to load quiz results' });
      } else {
        setQuiz(data.quiz);
        setStudents(data.students || []);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId, val) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, marksObtained: val } : s))
    );
  };

  const handleSaveResults = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      const results = students.map((s) => ({
        studentId: s._id,
        marksObtained: s.marksObtained,
      }));

      const res = await fetch(`/api/teacher/quizzes/${quizId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to save quiz scores' });
      } else {
        setFeedback({ type: 'success', text: data.message || 'Quiz results updated successfully!' });
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
          href="/teacher/quizzes"
          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Quizzes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-400" />
              {quiz?.title || 'Quiz Scores'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Subject: <strong className="text-indigo-400">{quiz?.subjectId?.subjectName}</strong> • Maximum Score: <strong className="text-white font-mono">{quiz?.maxMarks} Marks</strong>
            </p>
          </div>
        </div>
      </div>

      {feedback.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            Loading student roster...
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No students found for this class cohort.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {students.map((student) => {
              const numeric = parseFloat(student.marksObtained);
              const max = quiz?.maxMarks || 20;
              const pct = !isNaN(numeric) && max > 0 ? Math.round((numeric / max) * 100) : null;

              return (
                <div
                  key={student._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center">
                      #{String(student.rollNumber).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-white">{student.name}</h3>
                      <p className="text-[11px] text-slate-400">Section {student.section}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {pct !== null && (
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                          pct >= 80
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : pct >= 50
                            ? 'bg-indigo-500/15 text-indigo-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {pct}%
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max={quiz?.maxMarks}
                        value={student.marksObtained}
                        onChange={(e) => handleScoreChange(student._id, e.target.value)}
                        placeholder="Marks"
                        className="w-20 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">/ {quiz?.maxMarks}</span>
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
          onClick={handleSaveResults}
          disabled={saving || loading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Quiz Scores
            </>
          )}
        </button>
      )}
    </div>
  );
}
