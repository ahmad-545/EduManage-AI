'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  BookOpen,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({ className: '', section: 'A' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to create class' });
      } else {
        setFeedback({ type: 'success', text: `${newClass.className} - Section ${newClass.section} created!` });
        setShowAddModal(false);
        setNewClass({ className: '', section: 'A' });
        fetchClasses();
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Academic Classes & Sections
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Overview of existing classes and assigned curriculum subjects. (Note: Classes are also auto-created when admitting students or assigning teachers).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Class
        </button>
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

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          Loading classes and subjects...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-sky-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 font-mono">
                    Sec {cls.section}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{cls.className}</h3>
                <p className="text-xs text-slate-500 mb-4">Academic Session 2026</p>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-4">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                    <span>{cls.studentCount || 0} Students</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{cls.subjects?.length || 0} Subjects</span>
                  </div>
                </div>

                {cls.subjects && cls.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {cls.subjects.map((sub) => (
                      <span
                        key={sub._id}
                        className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium"
                      >
                        {sub.subjectName}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200">
                <Link
                  href={`/admin/classes/${cls._id}/subjects`}
                  className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold rounded-xl text-xs border border-sky-200 transition flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                  Manage Subjects ({cls.subjects?.length || 0})
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Create New Academic Class</h2>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  value={newClass.className}
                  onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                  placeholder="e.g. Class 9, Class 10, O-Levels"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Section
                </label>
                <input
                  type="text"
                  required
                  value={newClass.section}
                  onChange={(e) => setNewClass({ ...newClass, section: e.target.value.toUpperCase() })}
                  placeholder="A, B, C"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
