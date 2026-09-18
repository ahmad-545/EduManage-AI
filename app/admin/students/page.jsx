'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ClassWiseStudentList from '../../../components/shared/ClassWiseStudentList';
import { GraduationCap, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/classes'),
      ]);

      const sData = await studentsRes.json();
      const cData = await classesRes.json();

      setStudents(sData.students || []);
      setClasses(cData.classes || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!confirm(`Are you sure you want to remove student "${name}"? All related attendance, grade, and fee records will be removed.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setFeedback({ type: 'success', text: data.message || 'Student deleted successfully.' });
        loadData();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to delete student' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Students Directory & Admissions
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage student cohorts, credentials, roll numbers, and parental WhatsApp contacts.
          </p>
        </div>

        <Link
          href="/admin/students/add"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Admit New Student
        </Link>
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
          Loading class-wise students...
        </div>
      ) : (
        <ClassWiseStudentList
          classes={classes}
          students={students}
          role="admin"
          onDeleteStudent={handleDeleteStudent}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
