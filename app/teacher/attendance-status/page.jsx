'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Coffee,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Award,
  Sparkles,
  DollarSign,
} from 'lucide-react';

export default function TeacherAttendanceStatusPage() {
  const [data, setData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      setLoading(true);
      const [attRes, salRes] = await Promise.all([
        fetch('/api/teacher/attendance-status'),
        fetch('/api/teacher/salary'),
      ]);
      const json = await attRes.json();
      const salJson = await salRes.json();
      setData(json);
      setSalaryData(salJson);
    } catch (err) {
      console.error('Failed to load attendance status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/teacher/dashboard"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-sky-600" />
            My Attendance Record & History
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            View your official faculty presence, late punch-ins, and half-leave records maintained by administration.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          Loading attendance records...
        </div>
      ) : !data ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-2xs">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-60 text-slate-400" />
          Failed to load attendance information.
        </div>
      ) : (
        <>
          {/* Today's Status Hero Card */}
          <div
            className={`p-6 rounded-2xl border shadow-xs transition ${
              data.todayRecord?.status === 'present'
                ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-white border-emerald-200'
                : data.todayRecord?.status === 'absent'
                ? 'bg-gradient-to-r from-rose-500/10 via-rose-50 to-white border-rose-200'
                : data.todayRecord?.status === 'late'
                ? 'bg-gradient-to-r from-amber-500/10 via-amber-50 to-white border-amber-200'
                : data.todayRecord?.status === 'half-day'
                ? 'bg-gradient-to-r from-purple-500/10 via-purple-50 to-white border-purple-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    data.todayRecord?.status === 'present'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : data.todayRecord?.status === 'absent'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : data.todayRecord?.status === 'late'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : data.todayRecord?.status === 'half-day'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {data.todayRecord?.status === 'present' && <CheckCircle2 className="w-7 h-7" />}
                  {data.todayRecord?.status === 'absent' && <XCircle className="w-7 h-7" />}
                  {data.todayRecord?.status === 'late' && <Clock className="w-7 h-7" />}
                  {data.todayRecord?.status === 'half-day' && <Coffee className="w-7 h-7" />}
                  {(!data.todayRecord?.isMarked || data.todayRecord?.status === 'not-marked') && (
                    <Calendar className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Today&apos;s Status • {getDayName(data.today)}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        data.todayRecord?.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : data.todayRecord?.status === 'absent'
                          ? 'bg-rose-100 text-rose-800'
                          : data.todayRecord?.status === 'late'
                          ? 'bg-amber-100 text-amber-800'
                          : data.todayRecord?.status === 'half-day'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {data.todayRecord?.status === 'present' && 'Present'}
                      {data.todayRecord?.status === 'absent' && 'Absent'}
                      {data.todayRecord?.status === 'late' && 'Late Arrival'}
                      {data.todayRecord?.status === 'half-day' && 'Half Leave'}
                      {(!data.todayRecord?.isMarked || data.todayRecord?.status === 'not-marked') &&
                        'Not Marked Yet'}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    {data.todayRecord?.status === 'present' && 'You are officially marked Present today.'}
                    {data.todayRecord?.status === 'absent' && 'Recorded as Absent for the full day.'}
                    {data.todayRecord?.status === 'late' && 'Recorded as Late Arrival for today.'}
                    {data.todayRecord?.status === 'half-day' && 'Recorded on Half Leave for today.'}
                    {(!data.todayRecord?.isMarked || data.todayRecord?.status === 'not-marked') &&
                      'Today\'s attendance is pending review by the school administration.'}
                  </h2>

                  {/* Half leave details */}
                  {data.todayRecord?.status === 'half-day' && (
                    <div className="mt-3 p-3 rounded-xl bg-purple-100/70 border border-purple-200 text-xs text-purple-900 space-y-1.5">
                      {data.todayRecord?.missedLectures && data.todayRecord.missedLectures.length > 0 ? (
                        <div>
                          <strong className="block text-[11px] uppercase tracking-wider text-purple-950 mb-1">
                            Missed / Unconducted Lecture(s):
                          </strong>
                          <div className="flex flex-wrap gap-1.5">
                            {data.todayRecord.missedLectures.map((m, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-lg bg-purple-200 border border-purple-300 font-semibold"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="italic">No specific missed lectures recorded for this half leave.</p>
                      )}

                      {data.todayRecord?.remarks && (
                        <p className="pt-1 text-[11px] text-purple-800">
                          <strong>Admin Remarks:</strong> {data.todayRecord.remarks}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance percentage indicator */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shrink-0 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Overall Ratio
                </span>
                <p className="text-2xl font-extrabold text-sky-700 font-mono mt-0.5">
                  {data.stats?.attendancePercentage || 100}%
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Faculty Rating</span>
              </div>
            </div>
          </div>

          {/* Monthly Salary Status Card */}
          {salaryData && (
            <div
              className={`p-5 rounded-2xl border shadow-2xs transition ${
                salaryData.currentSalary?.status === 'paid'
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      salaryData.currentSalary?.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">
                        {salaryData.currentMonth} Monthly Salary
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          salaryData.currentSalary?.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {salaryData.currentSalary?.status === 'paid'
                          ? 'Paid / Disbursed'
                          : 'Payment Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {salaryData.currentSalary?.status === 'paid'
                        ? `Disbursed via ${
                            salaryData.currentSalary?.paymentMethod || 'Bank Transfer'
                          }${
                            salaryData.currentSalary?.paidDate
                              ? ' on ' +
                                new Date(salaryData.currentSalary.paidDate).toLocaleDateString()
                              : ''
                          }.`
                        : 'Your monthly salary disbursement is currently pending in administration queue.'}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Net Amount
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 font-mono">
                    PKR {(salaryData.currentSalary?.netSalary || 50000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded Days</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{data.stats?.totalMarkedDays || 0}</p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Present</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-1 font-mono">{data.stats?.presentCount || 0}</p>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Absent</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-rose-900 mt-1 font-mono">{data.stats?.absentCount || 0}</p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Late</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-900 mt-1 font-mono">{data.stats?.lateCount || 0}</p>
            </div>

            <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Half Leave</span>
                <Coffee className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-1 font-mono">{data.stats?.halfDayCount || 0}</p>
            </div>
          </div>

          {/* Historical Attendance Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Attendance Log History</h3>
                <p className="text-xs text-slate-500">Chronological attendance entries recorded by Administration</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {data.history?.length || 0} entries
              </span>
            </div>

            {(!data.history || data.history.length === 0) ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No past attendance records found in the system yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date & Day</th>
                      <th className="py-3 px-4">Attendance Status</th>
                      <th className="py-3 px-4">Missed Lectures (Half Leave)</th>
                      <th className="py-3 px-4">Admin Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.history.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div>{getDayName(record.date)}</div>
                          <span className="text-[11px] text-slate-400 font-mono">{record.date}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
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

                        <td className="py-3.5 px-4">
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
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {record.remarks || <span className="text-slate-400 text-xs">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
