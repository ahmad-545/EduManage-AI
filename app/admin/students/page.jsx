'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ClassWiseStudentList from '../../../components/shared/ClassWiseStudentList';
import { GraduationCap, Plus, CheckCircle2, AlertCircle, DollarSign, Clock, Users, ArrowRight } from 'lucide-react';

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

  const totalMonthlyTuition = students.reduce((sum, s) => sum + (s.monthlyFee || 5000), 0);
  const paidCount = students.filter((s) => s.feeSummary?.currentMonthStatus === 'paid').length;
  const pendingCount = students.filter((s) => s.feeSummary?.currentMonthStatus === 'pending' || s.feeSummary?.hasPending).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Students Directory & Profiles
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage class-wise student cohorts, profiles, monthly fee structures, attendance, and parental WhatsApp contacts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/fees"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fee Ledger</span>
          </Link>

          <Link
            href="/admin/students/add"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Admit New Student</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Enrolled Students</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{students.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{classes.length} active classes & sections</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Monthly Tuition Volume</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            PKR {totalMonthlyTuition.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Sum of all student monthly fees</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Fees Paid (Current Month)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono">{paidCount}</div>
          <p className="text-[11px] text-emerald-600 mt-0.5">Fee received & verified</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Pending / Overdue Fees</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-700 font-mono">{pendingCount}</div>
          <p className="text-[11px] text-amber-600 mt-0.5">Students with unpaid challans</p>
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
