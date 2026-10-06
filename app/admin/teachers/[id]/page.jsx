'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  DollarSign,
  ClipboardCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Coffee,
  FileText,
  Printer,
  ChevronRight,
  Layers,
  Award,
  AlertCircle,
  Check,
  Building2,
  SlidersHorizontal,
  X,
  CreditCard,
} from 'lucide-react';

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'attendance' | 'salary'
  const [selectedMonthYm, setSelectedMonthYm] = useState('');
  const [slipData, setSlipData] = useState(null);

  useEffect(() => {
    if (teacherId) {
      fetchTeacherProfile();
    }
  }, [teacherId]);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/teachers/${teacherId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load teacher');

      setData(json);
      if (json.monthlyAttendance && json.monthlyAttendance.length > 0) {
        setSelectedMonthYm(json.monthlyAttendance[0].ymPrefix);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs">
        <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
        Loading complete educator profile dossier...
      </div>
    );
  }

  if (!data || !data.teacher) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-60 text-slate-400" />
        Teacher not found.
        <div className="mt-3">
          <Link href="/admin/teachers" className="text-sky-600 font-semibold hover:underline">
            Return to Teachers Directory
          </Link>
        </div>
      </div>
    );
  }

  const { teacher, assignments, schedules, attendanceHistory, monthlyAttendance, salaries, currentMonth, currentMonthSalary } = data;

  // Active month attendance data
  const activeMonthData = monthlyAttendance.find((m) => m.ymPrefix === selectedMonthYm) || monthlyAttendance[0];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <Link
              href="/admin/teachers"
              className="text-slate-500 hover:text-sky-600 flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Teachers Directory
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{teacher.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Faculty Profile & Dossier
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Complete records of assigned classes, weekly lectures, month-wise attendance, and salary history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/admin/teachers/${teacher._id}/assign`}
            className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-sky-600" />
            Assign Classes & Timetable
          </Link>

          <Link
            href="/admin/teachers/attendance"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ClipboardCheck className="w-4 h-4 text-slate-600" />
            Mark Attendance
          </Link>

          <Link
            href="/admin/teachers/salaries"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <DollarSign className="w-4 h-4" />
            Manage Salaries
          </Link>
        </div>
      </div>

      {/* Hero Teacher Identity Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
              {teacher.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-slate-900">{teacher.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    teacher.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {teacher.status === 'active' ? 'Active Faculty' : 'Pending Approval'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono">{teacher.phone || 'No phone recorded'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Salary Highlight in Hero Card */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 shrink-0">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Base Monthly Salary
              </span>
              <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                PKR {(teacher.baseSalary || 50000).toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    currentMonthSalary?.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-[11px] font-semibold text-slate-700">
                  {currentMonth}: {currentMonthSalary?.status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Classes</span>
            <BookOpen className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{assignments?.length || 0}</p>
          <span className="text-[11px] text-slate-500">Subject Cohorts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Lectures</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{schedules?.length || 0}</p>
          <span className="text-[11px] text-slate-500">Periods / Week</span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Attendance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1 font-mono">
            {activeMonthData?.attendanceRate || 100}%
          </p>
          <span className="text-[11px] text-emerald-700">{activeMonthData?.monthName || currentMonth}</span>
        </div>

        <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Salary Status</span>
            <DollarSign className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-xl font-bold text-sky-950 mt-1 uppercase">
            {currentMonthSalary?.status || 'PENDING'}
          </p>
          <span className="text-[11px] text-sky-700 font-mono">PKR {(currentMonthSalary?.netSalary || 50000).toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('classes')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'classes'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Classes & Weekly Timetable ({assignments?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'attendance'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          Month-Wise Attendance History ({attendanceHistory?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('salary')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'salary'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Salary & Payroll Ledger ({salaries?.length || 0})
        </button>
      </div>

      {/* TAB 1: CLASSES & TIMETABLE */}
      {activeTab === 'classes' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Assigned Class Cohorts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Teaching Class & Subject Cohorts</h3>
                <p className="text-xs text-slate-500">Classes and courses assigned to {teacher.name}</p>
              </div>
              <Link
                href={`/admin/teachers/${teacher._id}/assign`}
                className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-xl text-xs font-semibold transition"
              >
                + Edit Assignments
              </Link>
            </div>

            {(!assignments || assignments.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 italic">No classes or subjects assigned to this teacher yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {assignments.map((a) => (
                  <div
                    key={a._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 text-[10px] font-bold">
                        {a.classId?.className} - Section {a.classId?.section}
                      </span>
                      <BookOpen className="w-4 h-4 text-sky-600" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{a.subjectId?.subjectName || 'Subject'}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Full Curriculum Instructor</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Timetable Schedule */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Weekly Lecture Timetable</h3>
                <p className="text-xs text-slate-500">Scheduled classroom periods across Monday through Saturday</p>
              </div>
              <span className="text-xs font-mono text-slate-500">{schedules?.length || 0} Slots</span>
            </div>

            {(!schedules || schedules.length === 0) ? (
              <p className="text-xs text-slate-500 p-8 text-center italic">No timetable slots created yet for this teacher.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Day</th>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Class & Section</th>
                      <th className="py-3 px-4">Subject</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedules.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.day}</td>
                        <td className="py-3 px-4 font-mono text-sky-700 font-semibold">{s.timeSlot}</td>
                        <td className="py-3 px-4">
                          {s.teacherClassId?.classId?.className} - Section {s.teacherClassId?.classId?.section}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {s.teacherClassId?.subjectId?.subjectName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MONTH-WISE ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Month Selector Tabs */}
          {monthlyAttendance && monthlyAttendance.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Select Month:</span>
              {monthlyAttendance.map((m) => (
                <button
                  key={m.ymPrefix}
                  type="button"
                  onClick={() => setSelectedMonthYm(m.ymPrefix)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedMonthYm === m.ymPrefix
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m.monthName} ({m.attendanceRate}%)
                </button>
              ))}
            </div>
          )}

          {/* Active Month Stats Cards */}
          {activeMonthData && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recorded Days</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{activeMonthData.totalDays}</p>
                <span className="text-[10px] text-slate-500">{activeMonthData.monthName}</span>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Present</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-emerald-900 mt-1 font-mono">{activeMonthData.presentCount}</p>
                <span className="text-[10px] text-emerald-700">Days</span>
              </div>

              <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Absent</span>
                  <XCircle className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-2xl font-bold text-rose-900 mt-1 font-mono">{activeMonthData.absentCount}</p>
                <span className="text-[10px] text-rose-700">Full leaves</span>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Late</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-amber-900 mt-1 font-mono">{activeMonthData.lateCount}</p>
                <span className="text-[10px] text-amber-700">Late punch-ins</span>
              </div>

              <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Half Leave</span>
                  <Coffee className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900 mt-1 font-mono">{activeMonthData.halfDayCount}</p>
                <span className="text-[10px] text-purple-700">Partial leaves</span>
              </div>
            </div>
          )}

          {/* Missed Lectures List for Active Month if any */}
          {activeMonthData && activeMonthData.missedLectures && activeMonthData.missedLectures.length > 0 && (
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs">
              <span className="font-bold text-purple-950 block mb-1">
                Missed Lectures during Half Leaves ({activeMonthData.monthName}):
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {activeMonthData.missedLectures.map((m, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-200 text-purple-900 font-semibold text-xs">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Daily Attendance Records Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daily Attendance Log — {activeMonthData?.monthName || 'All Records'}
                </h3>
                <p className="text-xs text-slate-500">Day by day verification records</p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {(activeMonthData?.records || attendanceHistory)?.length || 0} Records
              </span>
            </div>

            {(!attendanceHistory || attendanceHistory.length === 0) ? (
              <p className="text-xs text-slate-500 p-8 text-center italic">No attendance records recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date & Day</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Missed Lectures (Half Leave)</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activeMonthData ? activeMonthData.records : attendanceHistory).map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <div>{getDayName(record.date)}</div>
                          <span className="text-[11px] text-slate-400 font-mono">{record.date}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              record.status === 'present'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : record.status === 'absent'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : record.status === 'late'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-purple-50 text-purple-800 border border-purple-200'
                            }`}
                          >
                            {record.status === 'present' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {record.status === 'absent' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                            {record.status === 'late' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                            {record.status === 'half-day' && <Coffee className="w-3.5 h-3.5 text-purple-600" />}
                            <span>{record.status === 'half-day' ? 'Half Leave' : record.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {record.status === 'half-day' && record.missedLectures && record.missedLectures.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {record.missedLectures.map((m, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-semibold"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{record.remarks || <span className="text-slate-400">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SALARY & PAYROLL LEDGER */}
      {activeTab === 'salary' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Current Month Quick Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Current Billing Cycle
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{currentMonth} Payroll</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Base Salary: PKR {(currentMonthSalary?.baseSalary || 50000).toLocaleString()} • Deductions: PKR {(currentMonthSalary?.deductions || 0).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Net Disbursement
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    PKR {(currentMonthSalary?.netSalary || 50000).toLocaleString()}
                  </span>
                </div>

                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                    currentMonthSalary?.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {currentMonthSalary?.status === 'paid' ? 'Paid' : 'Pending'}
                </span>

                <Link
                  href="/admin/teachers/salaries"
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Adjust / Pay
                </Link>
              </div>
            </div>
          </div>

          {/* Salary History Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Salary Disbursement Ledger</h3>
                <p className="text-xs text-slate-500">Historical monthly salary records and payment details</p>
              </div>
              <span className="text-xs font-mono text-slate-500">{salaries?.length || 0} Cycles</span>
            </div>

            {(!salaries || salaries.length === 0) ? (
              <p className="text-xs text-slate-500 p-8 text-center italic">No salary records generated yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Billing Month</th>
                      <th className="py-3 px-4">Base Salary</th>
                      <th className="py-3 px-4">Deductions</th>
                      <th className="py-3 px-4">Bonus</th>
                      <th className="py-3 px-4">Net Paid Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salaries.map((sal) => (
                      <tr key={sal._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">{sal.month}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">PKR {sal.baseSalary.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-rose-700">
                          {sal.deductions > 0 ? `-PKR ${sal.deductions.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-700">
                          {sal.bonus > 0 ? `+PKR ${sal.bonus.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          PKR {sal.netSalary.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              sal.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {sal.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{sal.paymentMethod || 'Bank Transfer'}</td>
                        <td className="py-3 px-4 text-right">
                          {sal.status === 'paid' && (
                            <button
                              type="button"
                              onClick={() =>
                                setSlipData({
                                  teacher,
                                  salary: sal,
                                  attendance: activeMonthData || { presentCount: '—', absentCount: '—', halfDayCount: '—', attendanceRate: 100 },
                                })
                              }
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 inline-flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3 text-emerald-600" />
                              Slip
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Salary Slip Printable Modal */}
      {slipData && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSlipData(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Slip Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                      EM
                    </div>
                    <span className="text-base font-extrabold text-slate-900 tracking-tight">
                      EduManage AI Academy
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Official Faculty Salary Voucher & Slip</p>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    PAID / DISBURSED
                  </span>
                  <p className="text-[11px] text-slate-500 font-mono mt-1">{slipData.salary.month}</p>
                </div>
              </div>

              {/* Employee & Date */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Faculty Member</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{slipData.teacher.name}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{slipData.teacher.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Disbursement Date</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {slipData.salary.paidDate ? new Date(slipData.salary.paidDate).toLocaleDateString() : 'Recorded'}
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    Method: {slipData.salary.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Earnings Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Base Monthly Salary</span>
                  <span className="font-mono font-bold text-slate-900">
                    PKR {slipData.salary.baseSalary.toLocaleString()}
                  </span>
                </div>
                {slipData.salary.bonus > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-emerald-700">
                    <span>Performance Bonus</span>
                    <span className="font-mono font-bold">+PKR {slipData.salary.bonus.toLocaleString()}</span>
                  </div>
                )}
                {slipData.salary.deductions > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-rose-700">
                    <span>Attendance Deductions</span>
                    <span className="font-mono font-bold">-PKR {slipData.salary.deductions.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-2.5 border-t-2 border-slate-900 text-sm font-extrabold">
                  <span className="text-slate-900">Total Net Disbursed:</span>
                  <span className="font-mono text-emerald-700 text-base">
                    PKR {slipData.salary.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Transaction ID if any */}
              {slipData.salary.transactionId && (
                <p className="text-[11px] text-slate-500 font-mono">
                  Ref / Transaction ID: {slipData.salary.transactionId}
                </p>
              )}

              {/* Signature Stamps */}
              <div className="pt-8 flex justify-between items-end text-center text-xs text-slate-500">
                <div className="border-t border-slate-300 w-36 pt-1">
                  <span>Accounts Officer</span>
                </div>
                <div className="border-t border-slate-300 w-36 pt-1">
                  <span>Principal / Director</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setSlipData(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
