'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  BookOpen,
  Building2,
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  ArrowLeft,
  Users,
} from 'lucide-react';

export default function TeacherSchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
      const res = await fetch('/api/teacher/schedule');
      const data = await res.json();
      setSchedule(data.schedule || []);
      setTeacher(data.teacher || null);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter slots for active day
  const activeDaySlots = schedule.filter((s) => s.day === selectedDay);

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
          href="/teacher/dashboard"
          className="text-slate-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Educator Dashboard
        </Link>
        <Link
          href="/teacher/my-classes"
          className="text-sky-600 hover:text-sky-700 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Users className="w-3.5 h-3.5" /> Manage All Classes & Lectures
        </Link>
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
              Select a day below to view your scheduled lecture periods, target classes, rooms, and quickly mark attendance or enter marks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3.5 py-1.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl">
              Total Weekly Lectures: <strong className="font-bold">{schedule.length}</strong>
            </span>
          </div>
        </div>

        {/* Day Tabs with Lecture Counts */}
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
              No Lectures Scheduled on {selectedDay}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any teaching periods allocated for this day. You can use this day for grading, lesson planning, and student mentoring.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-600">
                You have <span className="font-bold text-slate-900">{activeDaySlots.length} lecture{activeDaySlots.length === 1 ? '' : 's'}</span> to conduct on {selectedDay}
              </span>
            </div>

            {/* Lecture Cards Grid matching Minhaj University CMS layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {/* Top Cyan Pill Header: Lecture 1, Lecture 2, etc. */}
                    <div className="px-4 pt-4">
                      <div className="bg-[#00BCD4] text-white font-bold text-sm tracking-wide text-center py-2 px-4 rounded-xl shadow-xs">
                        Lecture {index + 1}
                      </div>
                    </div>

                    {/* Card Body Details */}
                    <div className="p-5 space-y-4">
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

                      {/* Subject Code & Name */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 shrink-0 mt-0.5">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 leading-snug">
                            {subjectCode} - {subjectName}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            Assigned Course
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
                          {slot.room || 'Room 6205'}
                        </span>
                      </div>

                      {/* Direct Quick Actions for Educator */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          href={`/teacher/attendance/${classIdStr}/${subjectIdStr}`}
                          className="flex-1 py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Attendance</span>
                        </Link>

                        <Link
                          href={`/teacher/marks/${classIdStr}/${subjectIdStr}`}
                          className="flex-1 py-2 px-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition"
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
          </div>
        )}
      </div>
    </div>
  );
}
