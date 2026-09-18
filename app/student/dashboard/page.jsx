'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Award,
  CalendarCheck,
  DollarSign,
  Calendar,
  BookOpen,
  User,
  Sparkles,
  ArrowRight,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Building2,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const [data, setData] = useState({ student: null, subjects: [] });
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getTodayName = () => {
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    return daysOfWeek.includes(today) ? today : 'Monday';
  };

  const [selectedDay, setSelectedDay] = useState('Monday');

  useEffect(() => {
    setSelectedDay(getTodayName());
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [myDataRes, schedRes] = await Promise.all([
        fetch('/api/student/my-data'),
        fetch('/api/student/schedule'),
      ]);

      const myDataJson = await myDataRes.json();
      const schedJson = await schedRes.json();

      setData(myDataJson);
      setSchedule(schedJson.schedule || []);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const student = data.student;
  const subjects = data.subjects || [];

  // Calculate overall attendance average
  const avgAttendance =
    subjects.length > 0
      ? Math.round(
          subjects.reduce((sum, s) => sum + (s.attendancePercent || 0), 0) / subjects.length
        )
      : 100;

  const admissionDateFormatted = student?.admissionDate
    ? new Date(student.admissionDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Session 2026';

  // Filter schedule for active day
  const activeDaySlots = schedule.filter((s) => s.day === selectedDay);

  const getSubjectCode = (subjectName, index) => {
    if (!subjectName) return `LEC${100 + index * 10}`;
    const clean = subjectName.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const prefix = clean.slice(0, 4) || 'SUB';
    return `${prefix}${101 + index * 12}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Student Profile Card at Top */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-bold text-xl shrink-0">
              {student?.name ? student.name.charAt(0) : 'S'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {student?.name || 'Student Portal'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 text-xs font-mono font-semibold border border-sky-200">
                  Roll #{student?.rollNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  {student?.feeStatus || 'Fee Active'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {student?.classId?.className} — Section {student?.section} • Academic Session 2026
              </p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/student/schedule"
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Full Timetable</span>
            </Link>

            <Link
              href="/student/datesheet"
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Datesheet</span>
            </Link>

            <Link
              href="/student/roll-number-slip"
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>Roll No Slip</span>
            </Link>
          </div>
        </div>

        {/* Detailed Profile Info Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium block">Portal Login ID</span>
            <span className="font-mono font-semibold text-sky-700 flex items-center gap-1 truncate">
              <Mail className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              {student?.email || '—'}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium block">Admission Date</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {admissionDateFormatted}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium block">Class & Section</span>
            <span className="font-semibold text-slate-800">
              {student?.classId?.className} - {student?.section}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium block">Parent WhatsApp</span>
            <span className="font-mono font-semibold text-emerald-700 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {student?.parentPhone || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overall Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 font-mono">
            {avgAttendance}%
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                avgAttendance >= 80
                  ? 'bg-emerald-500'
                  : avgAttendance >= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${avgAttendance}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Enrolled Courses</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 font-mono">
            {subjects.length}
          </p>
          <p className="text-[11px] text-sky-700 font-medium mt-1">
            Active curriculum subjects
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Weekly Lectures</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 font-mono">
            {schedule.length}
          </p>
          <Link
            href="/student/schedule"
            className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold mt-1 inline-flex items-center gap-1"
          >
            Open Timetable <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. Day-Wise Lecture Schedule Timetable widget matching Minhaj CMS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              Lecture Schedule Timetable
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any day to see how many lectures you have and their exact timings and rooms.
            </p>
          </div>

          <Link
            href="/student/schedule"
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
            No lectures scheduled for {selectedDay}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
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
                  {/* Top Cyan Pill Header: Lecture 1, Lecture 2 */}
                  <div className="px-4 pt-4">
                    <div className="bg-[#00BCD4] text-white font-bold text-sm tracking-wide text-center py-2 px-4 rounded-xl shadow-xs">
                      Lecture {index + 1}
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="p-5 space-y-3.5">
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
                          Core Curriculum
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
                      <span className="font-semibold text-slate-800">{slot.room || 'Room 6212'}</span>
                    </div>

                    {/* Teacher Details */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">
                          {teacherObj.name || 'Faculty Member'}
                        </span>
                      </div>

                      {teacherObj.email && (
                        <a
                          href={`mailto:${teacherObj.email}`}
                          title={`Email ${teacherObj.name}`}
                          className="p-1 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition"
                        >
                          <Mail className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Enrolled Subjects Detailed Overviews (With Teacher Email, Subject Attendance, Marks, Quizzes) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            My Subjects & Course Overviews
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Subject-wise attendance record, examination grades, quiz scores, and instructor contacts.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
            Loading your subjects and grades...
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs">
            No subjects registered for your class cohort yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {subjects.map((sub) => (
              <div
                key={sub.subjectId}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-sky-300 transition space-y-4"
              >
                <div>
                  {/* Subject Title & Grade Badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {sub.subjectName}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Core Academic Course
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border ${
                        sub.currentGrade === 'A+' || sub.currentGrade === 'A'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : sub.currentGrade === 'B'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Grade: {sub.currentGrade}
                    </span>
                  </div>

                  {/* Teacher Information (Name & Email) */}
                  <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-600" /> Instructor:
                      </span>
                      <span className="font-bold text-slate-900">{sub.teacherName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-sky-600" /> Teacher Email:
                      </span>
                      <a
                        href={`mailto:${sub.teacherEmail}`}
                        className="font-mono text-sky-700 hover:underline font-semibold"
                      >
                        {sub.teacherEmail}
                      </a>
                    </div>
                  </div>

                  {/* Subject-Wise Attendance Progress */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-semibold flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" /> Subject Attendance:
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {sub.attendancePercent}% ({sub.presentDays || 0}/{sub.attendanceLogsCount || 0} Lectures)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          sub.attendancePercent >= 80
                            ? 'bg-emerald-500'
                            : sub.attendancePercent >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${sub.attendancePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Academic Results Grid (Marks & Quizzes) */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                        Exam Marks:
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {sub.latestExamMarks || 'In Progress'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                        Quiz Average:
                      </span>
                      <span className="font-mono font-bold text-sky-700 text-xs">
                        {sub.quizAveragePercent !== null ? `${sub.quizAveragePercent}%` : 'No Quizzes'}
                      </span>
                    </div>
                  </div>

                  {/* Lecture Timetable for this subject */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-600" /> Allocated Slots:
                    </span>
                    {sub.scheduleSlots && sub.scheduleSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {sub.scheduleSlots.map((slot, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-[11px] text-sky-800 font-mono font-medium"
                          >
                            {slot.day}: {slot.timeSlot}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Weekly Timetable Active
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
