'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Coffee,
  Save,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlertCircle,
  Plus,
  Trash2,
  DollarSign,
} from 'lucide-react';

export default function TeacherAttendanceManagementPage() {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(getTodayString);
  const [dayName, setDayName] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [customMissedInput, setCustomMissedInput] = useState({});

  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const fetchAttendanceData = async (date) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/teachers/attendance?date=${date}`);
      const data = await res.json();

      setDayName(data.dayName || '');
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error('Failed to load teacher attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (teacherId, newStatus) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t._id === teacherId) {
          return {
            ...t,
            status: newStatus,
          };
        }
        return t;
      })
    );
  };

  const handleToggleMissedLecture = (teacherId, lectureDisplay) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t._id === teacherId) {
          const current = t.missedLectures || [];
          const exists = current.includes(lectureDisplay);
          const updated = exists
            ? current.filter((item) => item !== lectureDisplay)
            : [...current, lectureDisplay];
          return { ...t, missedLectures: updated };
        }
        return t;
      })
    );
  };

  const handleAddCustomMissedLecture = (teacherId) => {
    const text = (customMissedInput[teacherId] || '').trim();
    if (!text) return;

    setTeachers((prev) =>
      prev.map((t) => {
        if (t._id === teacherId) {
          const current = t.missedLectures || [];
          if (!current.includes(text)) {
            return { ...t, missedLectures: [...current, text] };
          }
        }
        return t;
      })
    );

    setCustomMissedInput((prev) => ({ ...prev, [teacherId]: '' }));
  };

  const handleRemoveMissedLecture = (teacherId, itemToRemove) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t._id === teacherId) {
          return {
            ...t,
            missedLectures: (t.missedLectures || []).filter((x) => x !== itemToRemove),
          };
        }
        return t;
      })
    );
  };

  const handleRemarksChange = (teacherId, text) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t._id === teacherId) {
          return { ...t, remarks: text };
        }
        return t;
      })
    );
  };

  const markAllPresent = () => {
    setTeachers((prev) =>
      prev.map((t) => ({
        ...t,
        status: 'present',
        missedLectures: [],
      }))
    );
    showToast('All teachers marked as Present! Click "Save Attendance" to confirm.');
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const records = teachers.map((t) => ({
        teacherId: t._id,
        status: t.status,
        missedLectures: t.status === 'half-day' ? t.missedLectures || [] : [],
        remarks: t.remarks || '',
      }));

      const res = await fetch('/api/admin/teachers/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, records }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save attendance');
      }

      showToast(`Teacher attendance for ${selectedDate} saved successfully!`);
      fetchAttendanceData(selectedDate);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const shiftDate = (days) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Stats
  const total = teachers.length;
  const presentCount = teachers.filter((t) => t.status === 'present').length;
  const absentCount = teachers.filter((t) => t.status === 'absent').length;
  const lateCount = teachers.filter((t) => t.status === 'late').length;
  const halfDayCount = teachers.filter((t) => t.status === 'half-day').length;

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/teachers"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              ← Teachers Directory
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-sky-600" />
            Teacher Daily Attendance
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Record daily faculty presence, absents, late arrivals, and half leave with missed lectures breakdown.
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => shiftDate(-1)}
              title="Previous Day"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1 text-xs font-semibold text-slate-800 bg-transparent border-0 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => shiftDate(1)}
              title="Next Day"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/admin/teachers/salaries"
            className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <DollarSign className="w-3.5 h-3.5 text-purple-600" />
            Monthly Salaries & Totals
          </Link>

          <button
            type="button"
            onClick={() => setSelectedDate(getTodayString())}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            Today
          </button>

          <button
            type="button"
            onClick={markAllPresent}
            className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Mark All Present
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Date Banner & Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date & Day</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{dayName || 'Selected Day'}</p>
          <p className="text-[11px] font-mono text-slate-500">{selectedDate}</p>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Present</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-900 mt-1">{presentCount}</p>
          <p className="text-[10px] text-emerald-700">of {total} teachers</p>
        </div>

        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Absent</p>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold text-rose-900 mt-1">{absentCount}</p>
          <p className="text-[10px] text-rose-700">full day leave</p>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Late Arrival</p>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-900 mt-1">{lateCount}</p>
          <p className="text-[10px] text-amber-700">delayed punch-in</p>
        </div>

        <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider">Half Leave</p>
            <Coffee className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-purple-900 mt-1">{halfDayCount}</p>
          <p className="text-[10px] text-purple-700">partial day leave</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search educator by name or email..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono hidden md:inline">
          {filteredTeachers.length} Active Faculty Members
        </span>
      </div>

      {/* Teachers Attendance List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          Loading faculty attendance roster for {selectedDate}...
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-2xs">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-60 text-slate-400" />
          No active teachers found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeachers.map((teacher) => {
            const isHalfDay = teacher.status === 'half-day';

            return (
              <div
                key={teacher._id}
                className={`bg-white border rounded-2xl p-5 shadow-2xs transition ${
                  isHalfDay
                    ? 'border-purple-300 ring-1 ring-purple-200'
                    : teacher.status === 'absent'
                    ? 'border-rose-200 bg-rose-50/20'
                    : teacher.status === 'late'
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Teacher Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{teacher.name}</h3>
                        {teacher.isMarked && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600">
                            Saved
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">{teacher.email}</p>
                      {teacher.phone && (
                        <p className="text-[10px] text-slate-400 font-mono">{teacher.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Radio Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Present */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(teacher._id, 'present')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        teacher.status === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Present
                    </button>

                    {/* Absent */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(teacher._id, 'absent')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        teacher.status === 'absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-800 border border-slate-200'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Absent
                    </button>

                    {/* Late */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(teacher._id, 'late')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        teacher.status === 'late'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Late
                    </button>

                    {/* Half Leave */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(teacher._id, 'half-day')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        teacher.status === 'half-day'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-purple-800 border border-slate-200'
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      Half Leave
                    </button>
                  </div>
                </div>

                {/* Scheduled Lectures Summary for today */}
                {teacher.todaySchedule && teacher.todaySchedule.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-sky-600" />
                      Today&apos;s Lectures ({teacher.todaySchedule.length}):
                    </span>
                    {teacher.todaySchedule.map((s) => (
                      <span
                        key={s._id}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                      >
                        {s.subjectName} ({s.timeSlot})
                      </span>
                    ))}
                  </div>
                )}

                {/* SPECIAL HALF LEAVE BOX (EXPANDS WHEN HALF-DAY IS SELECTED) */}
                {isHalfDay && (
                  <div className="mt-4 p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-purple-700" />
                      <h4 className="text-xs font-bold text-purple-900">
                        Half Leave Details — Select Missed Lectures
                      </h4>
                    </div>

                    <p className="text-[11px] text-purple-800 leading-relaxed">
                      Please specify which lecture(s) or class periods were <strong>not conducted / missed</strong> by the teacher during their half leave.
                    </p>

                    {/* Today's Lectures Checkboxes */}
                    {teacher.todaySchedule && teacher.todaySchedule.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
                          Scheduled Lectures for Today (Check to mark as Missed):
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {teacher.todaySchedule.map((s) => {
                            const isMissed = (teacher.missedLectures || []).includes(s.display);
                            return (
                              <label
                                key={s._id}
                                className={`p-2 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition ${
                                  isMissed
                                    ? 'bg-purple-200/80 border-purple-400 font-semibold text-purple-950'
                                    : 'bg-white border-purple-200 text-slate-700 hover:bg-purple-100/50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isMissed}
                                  onChange={() => handleToggleMissedLecture(teacher._id, s.display)}
                                  className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                                />
                                <span className="truncate">{s.display}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-purple-700 italic">
                        No scheduled timetable slots found for {dayName}. You can add missed lectures manually below.
                      </p>
                    )}

                    {/* Custom Add Missed Lecture Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customMissedInput[teacher._id] || ''}
                        onChange={(e) =>
                          setCustomMissedInput({
                            ...customMissedInput,
                            [teacher._id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomMissedLecture(teacher._id);
                          }
                        }}
                        placeholder="e.g. 3rd Period (Chemistry) or 01:00 PM Lecture"
                        className="flex-1 px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomMissedLecture(teacher._id)}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Lecture
                      </button>
                    </div>

                    {/* Active Missed Lectures Pills */}
                    {teacher.missedLectures && teacher.missedLectures.length > 0 && (
                      <div className="pt-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                          Lectures Recorded as Missed:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {teacher.missedLectures.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-200 border border-purple-300 text-purple-900 text-xs font-semibold"
                            >
                              <span>{item}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveMissedLecture(teacher._id, item)}
                                className="text-purple-700 hover:text-purple-950"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Half Leave Remarks / Reason */}
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                        Reason / Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={teacher.remarks || ''}
                        onChange={(e) => handleRemarksChange(teacher._id, e.target.value)}
                        placeholder="e.g. Approved medical appointment after 12:00 PM"
                        className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Save Bar */}
      {!loading && filteredTeachers.length > 0 && (
        <div className="sticky bottom-4 z-20 bg-white border border-slate-200 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Changes are stored when you click Save. Teachers will instantly see today&apos;s status on their portal.</span>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Teacher Attendance'}
          </button>
        </div>
      )}
    </div>
  );
}
