'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Plus,
  ArrowRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Users,
  BookOpen,
} from 'lucide-react';

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    maxMarks: 20,
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizRes, classesRes] = await Promise.all([
        fetch('/api/teacher/quizzes'),
        fetch('/api/teacher/my-classes'),
      ]);

      const qData = await quizRes.json();
      const cData = await classesRes.json();

      setQuizzes(qData.quizzes || []);
      setAssignedSubjects(cData.assignedSubjects || []);
      if (cData.assignedSubjects?.length > 0) {
        setFormData((prev) => ({ ...prev, subjectId: cData.assignedSubjects[0].subjectId }));
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      const res = await fetch('/api/teacher/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to create quiz' });
      } else {
        setFeedback({ type: 'success', text: `Quiz "${formData.title}" created successfully!` });
        setShowCreateModal(false);
        setFormData({
          subjectId: assignedSubjects[0]?.subjectId || '',
          title: '',
          maxMarks: 20,
          date: new Date().toISOString().split('T')[0],
        });
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-400" />
            Class Quizzes & Pop Tests
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create quizzes for your assigned curriculum subjects and record individual student test marks.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          disabled={assignedSubjects.length === 0}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 self-start md:self-auto disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Create New Quiz
        </button>
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

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          Loading quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
          <Award className="w-10 h-10 text-indigo-500/40 mx-auto mb-3" />
          <p className="font-semibold text-slate-300 text-sm">No Quizzes Created Yet</p>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">
            Create your first pop quiz or test assessment using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((q) => {
            const subjectObj = q.subjectId || {};
            const classObj = subjectObj.classId || {};

            return (
              <div
                key={q._id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 text-[10px] font-semibold">
                      {classObj.className ? `${classObj.className} - ${classObj.section}` : 'Assigned Class'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {q.date}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{q.title}</h3>
                  <p className="text-xs text-teal-400 font-medium mb-3">{subjectObj.subjectName}</p>

                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 grid grid-cols-2 gap-2 text-xs mb-4">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Max Marks:</span>
                      <span className="font-bold text-white font-mono">{q.maxMarks}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Recorded Scores:</span>
                      <span className="font-bold text-indigo-300 font-mono">{q.resultCount || 0} Students</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <Link
                    href={`/teacher/quizzes/${q._id}/results`}
                    className="w-full py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Enter / Update Results
                    <ArrowRight className="w-3 h-3 ml-auto" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <h2 className="text-base font-bold text-white">Create New Subject Quiz</h2>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Assigned Subject & Class
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {assignedSubjects.map((sub) => (
                    <option key={sub.subjectId} value={sub.subjectId}>
                      {sub.className}: {sub.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Quiz Title / Topic
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Chapter 4 Thermodynamics Quiz"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Test Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-md shadow-indigo-600/30"
                >
                  {submitting ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
