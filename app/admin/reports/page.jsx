'use client';

import { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  Award,
  AlertTriangle,
  GraduationCap,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      setClasses(data.classes || []);
      fetchInsights('');
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const fetchInsights = async (cId) => {
    try {
      setLoading(true);
      const url = cId ? `/api/ai/insights?classId=${cId}` : '/api/ai/insights';
      const res = await fetch(url);
      const data = await res.json();
      setInsightsData(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassFilterChange = (e) => {
    const val = e.target.value;
    setSelectedClassId(val);
    fetchInsights(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            AI Academic Reports & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            School-wide academic evaluations, student risk indicators, and predictive intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClassId}
            onChange={handleClassFilterChange}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Whole School Overview</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className} - Section {c.section}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchInsights(selectedClassId)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Refresh Analysis
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Target Cohort</span>
            <GraduationCap className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-base font-bold text-white mt-2 truncate">
            {insightsData?.contextName || 'Whole Academy'}
          </p>
          <span className="text-[11px] text-slate-500">
            {insightsData?.totalStudents || 0} enrolled students
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Attendance Ratio</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-teal-400 font-mono mt-2">
            {insightsData?.attendanceAverage || 0}%
          </p>
          <span className="text-[11px] text-teal-500/80">Average across subjects</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Attendance Flags (&lt;75%)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono mt-2">
            {insightsData?.lowAttendanceCount || 0}
          </p>
          <span className="text-[11px] text-amber-500/80">Students needing attention</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Top Performers (&gt;85%)</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400 font-mono mt-2">
            {insightsData?.topPerformersCount || 0}
          </p>
          <span className="text-[11px] text-indigo-500/80">High academic distinction</span>
        </div>
      </div>

      {/* Main AI Insights Document Card */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-7 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Executive Academic Diagnosis
              </h2>
              <p className="text-xs text-slate-400">
                Generated via OpenAI {insightsData?.generatedBy || 'gpt-4o-mini'} based on active attendance registers and examination logs.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            Compiling and synthesizing academic analytics...
          </div>
        ) : (
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
            {insightsData?.insights}
          </div>
        )}
      </div>
    </div>
  );
}
