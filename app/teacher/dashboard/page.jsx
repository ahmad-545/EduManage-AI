'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Award,
  Calendar,
  Sparkles,
  Users,
  BrainCircuit,
  ArrowRight,
  Clock,
  Building2,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Coffee,
  ClipboardCheck,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState({ classes: [], assignedSubjects: [], students: [] });
  const [schedule, setSchedule] = useState([]);
  const [insights, setInsights] = useState(null);
  const [attStatus, setAttStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getTodayName = () => {
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    return daysOfWeek.includes(today) ? today : 'Monday';
  };

  const [selectedDay, setSelectedDay] = useState('Monday');

  useEffect(() => {
    setSelectedDay(getTodayName());
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const [classRes, schedRes, insightsRes, attRes] = await Promise.all([
        fetch('/api/teacher/my-classes'),
        fetch('/api/teacher/schedule'),
        fetch('/api/ai/insights'),
        fetch('/api/teacher/attendance-status'),
      ]);

      const classData = await classRes.json();
      const schedData = await schedRes.json();
      const insData = await insightsRes.json();
      const attData = await attRes.json();

      setData(classData);
      setSchedule(schedData.schedule || []);
      setInsights(insData);
      setAttStatus(attData);
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter slots for active day tab
  const activeDaySlots = schedule.filter((s) => s.day === selectedDay);

  const getSubjectCode = (subjectName, index) => {
    if (!subjectName) return `LEC${100 + index * 10}`;
    const clean = subjectName.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const prefix = clean.slice(0, 4) || 'SUB';
    return `${prefix}${101 + index * 12}`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Educator Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {session?.user?.name || 'Educator'}!
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Day-wise lecture timetable, class cohorts, one-click attendance, and examination marks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/teacher/schedule"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Weekly Lecture Timetable
            </Link>
          </div>
        </div>
      </div>

      {/* Attendance Status Card for Today */}
      {attStatus && (
        <div
          className={`p-4 rounded-2xl border shadow-2xs transition ${
            attStatus.todayRecord?.status === 'present'
              ? 'bg-emerald-50/70 border-emerald-200'
              : attStatus.todayRecord?.status === 'absent'
              ? 'bg-rose-50/70 border-rose-200'
              : attStatus.todayRecord?.status === 'late'
              ? 'bg-amber-50/70 border-amber-200'
              : attStatus.todayRecord?.status === 'half-day'
              ? 'bg-purple-50/70 border-purple-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  attStatus.todayRecord?.status === 'present'
                    ? 'bg-emerald-100 text-emerald-700'
                    : attStatus.todayRecord?.status === 'absent'
                    ? 'bg-rose-100 text-rose-700'
                    : attStatus.todayRecord?.status === 'late'
                    ? 'bg-amber-100 text-amber-700'
                    : attStatus.todayRecord?.status === 'half-day'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {attStatus.todayRecord?.status === 'present' && <CheckCircle2 className="w-5 h-5" />}
                {attStatus.todayRecord?.status === 'absent' && <XCircle className="w-5 h-5" />}
                {attStatus.todayRecord?.status === 'late' && <Clock className="w-5 h-5" />}
                {attStatus.todayRecord?.status === 'half-day' && <Coffee className="w-5 h-5" />}
                {(!attStatus.todayRecord?.isMarked || attStatus.todayRecord?.status === 'not-marked') && (
                  <ClipboardCheck className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">Today&apos;s Faculty Attendance</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      attStatus.todayRecord?.status === 'present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : attStatus.todayRecord?.status === 'absent'
                        ? 'bg-rose-100 text-rose-800'
                        : attStatus.todayRecord?.status === 'late'
                        ? 'bg-amber-100 text-amber-800'
                        : attStatus.todayRecord?.status === 'half-day'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {attStatus.todayRecord?.status === 'present' && 'Present'}
                    {attStatus.todayRecord?.status === 'absent' && 'Absent'}
                    {attStatus.todayRecord?.status === 'late' && 'Late Arrival'}
                    {attStatus.todayRecord?.status === 'half-day' && 'Half Leave'}
                    {(!attStatus.todayRecord?.isMarked || attStatus.todayRecord?.status === 'not-marked') &&
                      'Pending Verification'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-0.5">
                  {attStatus.todayRecord?.status === 'present' &&
                    'You are marked Present today by the administration office.'}
                  {attStatus.todayRecord?.status === 'absent' &&
                    'You have been recorded as Absent today. Please check with admin if this is an error.'}
                  {attStatus.todayRecord?.status === 'late' &&
                    'You have been marked Late for today\'s morning punch-in.'}
                  {attStatus.todayRecord?.status === 'half-day' &&
                    'You have been recorded on Half Leave for today.'}
                  {(!attStatus.todayRecord?.isMarked || attStatus.todayRecord?.status === 'not-marked') &&
                    'Today\'s attendance has not been registered yet by administration.'}
                </p>

                {/* If Half-Day: Show Missed Lectures & Remarks */}
                {attStatus.todayRecord?.status === 'half-day' && (
                  <div className="mt-2 space-y-1">
                    {attStatus.todayRecord?.missedLectures &&
                      attStatus.todayRecord.missedLectures.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-purple-900">
                            Missed Lecture(s):
                          </span>
                          {attStatus.todayRecord.missedLectures.map((lec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-purple-200 text-purple-900 text-[10px] font-bold"
                            >
                              {lec}
                            </span>
                          ))}
                        </div>
                      )}
                    {attStatus.todayRecord?.remarks && (
                      <p className="text-[11px] text-purple-800 italic">
                        <strong>Admin Note:</strong> {attStatus.todayRecord.remarks}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/teacher/attendance-status"
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-sky-600" />
                Attendance Log ({attStatus.stats?.attendancePercentage || 100}%)
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned Cohorts</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 font-mono">
            {data.classes?.length || 0}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-sky-700 font-medium">
            <span>{data.assignedSubjects?.length || 0} Subject Course(s)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Enrolled Students</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 font-mono">
            {data.students?.length || 0}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-medium">
            <span>Across Assigned Sections</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Lectures / Week</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 font-mono">
            {schedule.length}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-teal-700 font-medium">
            <Link href="/teacher/schedule" className="hover:underline flex items-center gap-1">
              View Schedule <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Day-Wise Lecture Schedule Timetable widget matching Minhaj CMS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              Lecture Schedule Timetable
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any day to see how many lectures you have and which class cohorts to teach.
            </p>
          </div>

          <Link
            href="/teacher/schedule"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 self-start sm:self-auto"
          >
            Full Timetable Page <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Day Tabs */}
        <div className="border-b border-slate-200 flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pt-1">
          {daysOfWeek.map((day) => {
            const count = schedule.filter((s) => s.day === day).length;
            const isActive = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`pb-3 text-sm font-bold transition whitespace-nowrap flex items-center gap-2 relative ${
                  isActive
                    ? 'text-slate-900 border-b-2 border-indigo-950'
                    : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'
                }`}
              >
                <span>{day}</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition ${
                    isActive
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Day Lectures Content */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-2" />
            Loading lectures...
          </div>
        ) : activeDaySlots.length === 0 ? (
          <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            No lecture periods scheduled for {selectedDay}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {activeDaySlots.map((slot, index) => {
              const tc = slot.teacherClassId || {};
              const classObj = tc.classId || {};
              const subjObj = tc.subjectId || {};
              const subjectName = subjObj.subjectName || 'General Academic Lecture';
              const subjectCode = getSubjectCode(subjObj.subjectName, index);

              const classIdStr = classObj._id?.toString() || classObj.toString();
              const subjectIdStr = subjObj._id?.toString() || subjObj.toString();

              return (
                <div
                  key={slot._id || index}
                  className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Cyan Pill Header: Lecture 1, Lecture 2 */}
                  <div className="px-4 pt-4">
                    <div className="bg-[#00BCD4] text-white font-bold text-sm tracking-wide text-center py-2 px-4 rounded-xl shadow-xs">
                      Lecture {index + 1}
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="p-5 space-y-3.5">
                    {/* Target Class Cohort Banner */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold text-xs flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        {classObj.className || 'Class'} - Section {classObj.section || 'A'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Slot #{index + 1}
                      </span>
                    </div>

                    {/* Subject */}
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {subjectCode} - {subjectName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Assigned Course
                        </span>
                      </div>
                    </div>

                    {/* Time Slot */}
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{slot.timeSlot}</span>
                    </div>

                    {/* Room */}
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{slot.room || 'Room 6205'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Link
                        href={`/teacher/attendance/${classIdStr}/${subjectIdStr}`}
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Attendance</span>
                      </Link>

                      <Link
                        href={`/teacher/marks/${classIdStr}/${subjectIdStr}`}
                        className="flex-1 py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-sky-600" />
                        <span>Marks</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Performance Insights */}
      {insights && (
        <div className="bg-white border border-sky-200 rounded-2xl p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">EduManage AI Academic Diagnostics</h3>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
            {insights.insights}
          </div>
        </div>
      )}
    </div>
  );
}
