'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Layers,
  DollarSign,
  UserCheck,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTeachers: 0,
    pendingTeachers: 0,
    totalClasses: 0,
    feeCollected: 0,
    feePending: 0,
  });

  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [teachersRes, studentsRes, classesRes, feesRes] = await Promise.all([
        fetch('/api/admin/teachers'),
        fetch('/api/admin/students'),
        fetch('/api/admin/classes'),
        fetch('/api/admin/fees'),
      ]);

      const teachersData = await teachersRes.json();
      const studentsData = await studentsRes.json();
      const classesData = await classesRes.json();
      const feesData = await feesRes.json();

      const activeT = (teachersData.teachers || []).filter((t) => t.status === 'active').length;
      const pendingT = (teachersData.teachers || []).filter((t) => t.status === 'pending').length;

      setStats({
        totalStudents: (studentsData.students || []).length,
        activeTeachers: activeT,
        pendingTeachers: pendingT,
        totalClasses: (classesData.classes || []).length,
        feeCollected: feesData.stats?.totalCollected || 0,
        feePending: feesData.stats?.totalPending || 0,
      });

      // Fetch AI Insights
      fetchAiInsights();
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await fetch('/api/ai/insights');
      const data = await res.json();
      setAiInsights(data);
    } catch (err) {
      console.error('Error loading AI insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Super Admin Control Console
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Academy Management Dashboard
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Effortlessly manage students, faculty assignments, fee collections, and schedule timetables in one simple dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/students/add"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Admit New Student
            </Link>

            <Link
              href="/admin/teachers/pending"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-sky-600" />
              Approvals ({stats.pendingTeachers})
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Students</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 font-mono">
            {stats.totalStudents}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-sky-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active Enrolled Students</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Teachers</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 font-mono">
            {stats.activeTeachers}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Assigned Faculty</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 font-mono">
            {stats.pendingTeachers}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-700 font-medium">
            <Link href="/admin/teachers/pending" className="hover:underline flex items-center gap-1">
              Review Requests <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Fee Recovery</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 font-mono">
            PKR {stats.feeCollected.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="text-rose-600 font-semibold font-mono">PKR {stats.feePending.toLocaleString()}</span>
            <span>Pending</span>
          </div>
        </div>
      </div>

      {/* AI Performance Insights Card */}
      <div className="bg-white border border-sky-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                EduManage AI Academic Insights
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                  {aiInsights?.generatedBy || 'gpt-4o-mini'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Automated summary of academy attendance trends and student performance.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAiInsights}
            disabled={loadingInsights}
            className="self-start md:self-auto px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-sky-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 shadow-xs"
          >
            {loadingInsights ? (
              <div className="w-3.5 h-3.5 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Refresh Insights
          </button>
        </div>

        {loadingInsights ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-2" />
            Analyzing academy records with AI...
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap font-sans">
            {aiInsights?.insights || 'No academic records available to analyze yet.'}
          </div>
        )}
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/teachers"
          className="group bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 rounded-2xl p-5 transition duration-150 shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition">
            Manage Teachers & Lectures
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Assign educators to specific classes, subjects, and weekly timetable slots.
          </p>
        </Link>

        <Link
          href="/admin/fees"
          className="group bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 rounded-2xl p-5 transition duration-150 shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
            Fee Management & Receipts
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Record payments, download PDF vouchers, and send WhatsApp payment reminders.
          </p>
        </Link>

        <Link
          href="/admin/students"
          className="group bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 rounded-2xl p-5 transition duration-150 shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
            Students Directory
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            View student credentials, edit roll numbers, and organize class cohorts.
          </p>
        </Link>
      </div>
    </div>
  );
}
