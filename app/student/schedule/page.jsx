'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Mail,
  ArrowLeft,
  Building2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function StudentSchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Default to today if weekday, else Monday
  const getTodayName = () => {
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    return daysOfWeek.includes(today) ? today : 'Monday';
  };

  const [selectedDay, setSelectedDay] = useState('Monday');

  useEffect(() => {
    setSelectedDay(getTodayName());
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/schedule');
      const data = await res.json();
      setSchedule(data.schedule || []);
      setStudentInfo(data.student || null);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter slots for active day
  const activeDaySlots = schedule.filter((s) => s.day === selectedDay);

  // Generate subject code placeholder if needed e.g. "COMP213" or "MATH101"
  const getSubjectCode = (subjectName, index) => {
    if (!subjectName) return `LEC${100 + index * 10}`;
    const clean = subjectName.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const prefix = clean.slice(0, 4) || 'SUB';
    return `${prefix}${101 + index * 12}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/dashboard"
          className="text-slate-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Dashboard
        </Link>
        {studentInfo?.className && (
          <span className="px-3 py-1 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
            {studentInfo.className} - Section {studentInfo.section}
          </span>
        )}
      </div>

      {/* Main Card Container styled like Minhaj University Timetable */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Lecture Schedule Timetable
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Official academic timetable. Select a day below to view scheduled lectures, timings, rooms, and faculty.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl">
              Total Lectures: <strong className="text-slate-900">{schedule.length}</strong>
            </span>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="border-b border-slate-200 flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar pt-1">
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
          <div className="py-20 text-center text-slate-500 text-xs">
            <div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
            Loading {selectedDay}&apos;s lecture schedule...
          </div>
        ) : activeDaySlots.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-50 border border-slate-200/80 rounded-2xl p-8 space-y-2">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto opacity-60 mb-2" />
            <p className="font-bold text-slate-800 text-sm">
              No Lectures Scheduled for {selectedDay}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any classes scheduled on this day. Use this time for self-study, assignments, and exam preparation.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-600">
                Showing <span className="font-bold text-slate-900">{activeDaySlots.length} lecture{activeDaySlots.length === 1 ? '' : 's'}</span> on {selectedDay}
              </span>
            </div>

            {/* Lecture Cards Grid matching Minhaj University CMS layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDaySlots.map((slot, index) => {
                const tc = slot.teacherClassId || {};
                const teacherObj = tc.teacherId || {};
                const subjObj = tc.subjectId || {};
                const subjectName = subjObj.subjectName || 'General Academic Lecture';
                const subjectCode = getSubjectCode(subjObj.subjectName, index);

                return (
                  <div
                    key={slot._id || index}
                    className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top Cyan Pill Header: Lecture 1, Lecture 2, etc. */}
                    <div className="px-4 pt-4">
                      <div className="bg-[#00BCD4] text-white font-bold text-sm tracking-wide text-center py-2 px-4 rounded-xl shadow-xs">
                        Lecture {index + 1}
                      </div>
                    </div>

                    {/* Card Body Details */}
                    <div className="p-5 space-y-4">
                      {/* Subject Name & Code */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 shrink-0 mt-0.5">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 leading-snug">
                            {subjectCode} - {subjectName}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            Core Curriculum
                          </span>
                        </div>
                      </div>

                      {/* Time Slot */}
                      <div className="flex items-center gap-2.5 text-xs text-slate-700">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold font-mono text-slate-800">
                          {slot.timeSlot}
                        </span>
                      </div>

                      {/* Room Number */}
                      <div className="flex items-center gap-2.5 text-xs text-slate-700">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {slot.room || 'Room 6212'}
                        </span>
                      </div>

                      {/* Teacher Details */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {teacherObj.name || 'Faculty Member'}
                            </span>
                            {teacherObj.email && (
                              <span className="text-[11px] text-slate-500 font-mono block">
                                {teacherObj.email}
                              </span>
                            )}
                          </div>
                        </div>

                        {teacherObj.email && (
                          <a
                            href={`mailto:${teacherObj.email}`}
                            title={`Email ${teacherObj.name}`}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition border border-slate-200/60"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
