'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';

export default function ClassSubjectsPage() {
  const params = useParams();
  const classId = params.id;

  const [classInfo, setClassInfo] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classRes, subjectsRes] = await Promise.all([
        fetch('/api/admin/classes'),
        fetch(`/api/admin/subjects?classId=${classId}`),
      ]);

      const cData = await classRes.json();
      const sData = await subjectsRes.json();

      const currentClass = (cData.classes || []).find((c) => c._id === classId);
      setClassInfo(currentClass);
      setSubjects(sData.subjects || []);
    } catch (err) {
      console.error('Failed to load class subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          subjectName: newSubjectName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to add subject' });
      } else {
        setFeedback({ type: 'success', text: `Subject "${newSubjectName}" added successfully!` });
        setNewSubjectName('');
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subjectId, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? Any faculty assignment for this subject will also be removed.`)) return;

    try {
      const res = await fetch(`/api/admin/subjects?id=${subjectId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setFeedback({ type: 'success', text: `Subject "${name}" deleted.` });
        loadData();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to delete' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
        Loading curriculum subjects...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/admin/classes"
          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Classes
        </Link>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Curriculum Subjects for {classInfo?.className} - Section {classInfo?.section}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure courses and academic subjects offered in this class cohort.
        </p>
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

      {/* Add Subject Input */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <form onSubmit={handleAddSubject} className="flex items-center gap-3">
          <div className="relative flex-1">
            <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g. Physics, Biology, Advanced Calculus, Urdu Literature..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </form>
      </div>

      {/* Subjects List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Enrolled Subjects ({subjects.length})
          </h3>
        </div>

        {subjects.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No subjects added to this class yet. Add the first subject above.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {subjects.map((sub, index) => (
              <div
                key={sub._id}
                className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-bold text-xs font-mono">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{sub.subjectName}</h4>
                    <p className="text-[11px] text-slate-400">
                      Class: {classInfo?.className} - {classInfo?.section}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSubject(sub._id, sub.subjectName)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
