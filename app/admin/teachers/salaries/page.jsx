'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Printer,
  X,
  CreditCard,
  Building2,
  FileText,
  AlertCircle,
  Coffee,
  XCircle,
  SlidersHorizontal,
} from 'lucide-react';

export default function TeacherSalariesAndAttendancePage() {
  const getMonthsList = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(
        new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d)
      );
    }
    return months;
  };

  const availableMonths = getMonthsList();
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0]);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Pay / Edit Salary Modal State
  const [activeModalTeacher, setActiveModalTeacher] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    status: 'paid',
    baseSalary: 50000,
    deductions: 0,
    bonus: 0,
    paymentMethod: 'Bank Transfer',
    transactionId: '',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Print Salary Slip Modal State
  const [slipTeacher, setSlipTeacher] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchSalaries(selectedMonth);
  }, [selectedMonth]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const fetchSalaries = async (month) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/teachers/salaries?month=${encodeURIComponent(month)}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load salaries:', err);
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (item) => {
    setActiveModalTeacher(item);
    const sal = item.salary;
    setSalaryForm({
      status: sal.status === 'paid' ? 'paid' : 'paid', // default to paid when opening modal
      baseSalary: sal.baseSalary || 50000,
      deductions: sal.deductions || 0,
      bonus: sal.bonus || 0,
      paymentMethod: sal.paymentMethod || 'Bank Transfer',
      transactionId: sal.transactionId || '',
      remarks: sal.remarks || '',
    });
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    if (!activeModalTeacher) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/teachers/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: activeModalTeacher.teacher._id,
          month: selectedMonth,
          ...salaryForm,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update salary');

      showToast(`Salary for ${activeModalTeacher.teacher.name} updated to ${salaryForm.status.toUpperCase()}!`);
      setActiveModalTeacher(null);
      fetchSalaries(selectedMonth);
    } catch (err) {
      alert(err.message || 'Error updating salary');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatusQuick = async (item) => {
    const newStatus = item.salary.status === 'paid' ? 'pending' : 'paid';
    try {
      const res = await fetch('/api/admin/teachers/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: item.teacher._id,
          month: selectedMonth,
          status: newStatus,
          baseSalary: item.salary.baseSalary,
          deductions: item.salary.deductions,
          bonus: item.salary.bonus,
          paymentMethod: item.salary.paymentMethod || 'Bank Transfer',
          transactionId: item.salary.transactionId || '',
          remarks: item.salary.remarks || '',
        }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      showToast(`Salary status changed to ${newStatus.toUpperCase()}`);
      fetchSalaries(selectedMonth);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredTeachers = (data?.report || []).filter(
    (item) =>
      item.teacher.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.teacher.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
              href="/admin/teachers/attendance"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              ← Daily Attendance Marking
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Teacher Salaries & Monthly Attendance
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Teacher-wise monthly attendance totals, absents, half leaves, and payroll disbursement status (Paid vs Pending).
          </p>
        </div>

        {/* Month Selector & Quick Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/admin/teachers/attendance"
            className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <ClipboardCheck className="w-4 h-4 text-sky-600" />
            Daily Marking
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Monthly Payroll</span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            PKR {(data?.summary?.totalPayroll || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            {data?.summary?.totalTeachers || 0} Faculty Members
          </span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Disbursed (Paid)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1 font-mono">
            PKR {(data?.summary?.totalPaid || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {data?.summary?.paidCount || 0} Teachers Paid
          </span>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Outstanding (Pending)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1 font-mono">
            PKR {(data?.summary?.totalPending || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold">
            {data?.summary?.pendingCount || 0} Teachers Pending
          </span>
        </div>

        <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Active Billing Month</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-lg font-bold text-sky-900 mt-1">{selectedMonth}</p>
          <span className="text-[11px] text-sky-700">Monthly Cycle</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teacher by name or email..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono hidden md:inline">
          Showing {filteredTeachers.length} of {data?.report?.length || 0} Teachers
        </span>
      </div>

      {/* Teacher-Wise Roster & Salary Status */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          Loading faculty payroll and attendance records for {selectedMonth}...
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-2xs">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-60 text-slate-400" />
          No teacher records found for this month.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeachers.map((item) => {
            const isPaid = item.salary.status === 'paid';
            const att = item.attendance;
            const sal = item.salary;

            return (
              <div
                key={item.teacher._id}
                className={`bg-white border rounded-2xl p-5 shadow-2xs transition ${
                  isPaid ? 'border-slate-200' : 'border-amber-200 bg-amber-50/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Teacher Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center font-bold text-base shrink-0">
                      {item.teacher.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{item.teacher.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isPaid ? 'Paid' : 'Salary Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">{item.teacher.email}</p>
                      {item.teacher.phone && (
                        <p className="text-[11px] text-slate-400 font-mono">{item.teacher.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Attendance Stats Pills */}
                  <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
                      <span className="block font-bold">{att.presentCount}</span>
                      <span className="text-[9px] uppercase tracking-wider">Present</span>
                    </div>

                    <div className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-center">
                      <span className="block font-bold">{att.absentCount}</span>
                      <span className="text-[9px] uppercase tracking-wider">Absent</span>
                    </div>

                    <div className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-center">
                      <span className="block font-bold">{att.lateCount}</span>
                      <span className="text-[9px] uppercase tracking-wider">Late</span>
                    </div>

                    <div className="px-2 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-center">
                      <span className="block font-bold">{att.halfDayCount}</span>
                      <span className="text-[9px] uppercase tracking-wider">Half Leave</span>
                    </div>

                    <div className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-center">
                      <span className="block font-bold font-mono">{att.attendanceRate}%</span>
                      <span className="text-[9px] uppercase tracking-wider">Rate</span>
                    </div>
                  </div>

                  {/* Salary & Action Controls */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Net Salary
                      </span>
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        PKR {sal.netSalary.toLocaleString()}
                      </span>
                      {sal.deductions > 0 && (
                        <span className="block text-[10px] text-rose-600 font-medium">
                          (-{sal.deductions.toLocaleString()} ded.)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isPaid ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setSlipTeacher(item)}
                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-xs border border-emerald-200 flex items-center gap-1.5 transition shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            Salary Slip
                          </button>

                          <button
                            type="button"
                            onClick={() => openPayModal(item)}
                            title="Edit Salary Details"
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openPayModal(item)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Salary
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Missed Lectures breakdown row if half leaves exist */}
                {att.missedLectures && att.missedLectures.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                      <Coffee className="w-3 h-3 text-purple-600" />
                      Missed Lecture(s) in {selectedMonth}:
                    </span>
                    {att.missedLectures.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-medium"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pay / Edit Salary Modal */}
      {activeModalTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModalTeacher(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Manage Salary — {activeModalTeacher.teacher.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Month of {selectedMonth} • Absents: {activeModalTeacher.attendance.absentCount} | Half Leaves: {activeModalTeacher.attendance.halfDayCount}
                </p>
              </div>
            </div>

            <form onSubmit={handleSalarySubmit} className="space-y-4">
              {/* Status Radio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Salary Disbursement Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSalaryForm({ ...salaryForm, status: 'paid' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      salaryForm.status === 'paid'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    PAID (Disbursed)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSalaryForm({ ...salaryForm, status: 'pending' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      salaryForm.status === 'pending'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    PENDING (Unpaid)
                  </button>
                </div>
              </div>

              {/* Salary Figures */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Base Salary (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={salaryForm.baseSalary}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, baseSalary: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Deductions (PKR)
                  </label>
                  <input
                    type="number"
                    value={salaryForm.deductions}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, deductions: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-rose-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Bonus / Extra (PKR)
                  </label>
                  <input
                    type="number"
                    value={salaryForm.bonus}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, bonus: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-emerald-700 font-mono"
                  />
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Calculated Net Payable:</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  PKR {(salaryForm.baseSalary - salaryForm.deductions + salaryForm.bonus).toLocaleString()}
                </span>
              </div>

              {/* Payment Method & Transaction ID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={salaryForm.paymentMethod}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, paymentMethod: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash Counter</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online (EasyPaisa/JazzCash)">Online Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Transaction ID / Cheque #
                  </label>
                  <input
                    type="text"
                    value={salaryForm.transactionId}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, transactionId: e.target.value })
                    }
                    placeholder="e.g. TRX-98231 or Cash Voucher"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={salaryForm.remarks}
                  onChange={(e) =>
                    setSalaryForm({ ...salaryForm, remarks: e.target.value })
                  }
                  placeholder="e.g. Deducted 1 day absent; bonus for extra test marking"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalTeacher(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-60 shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Confirm & Save Salary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Salary Slip Printable Modal */}
      {slipTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSlipTeacher(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Slip Printable Container */}
            <div id="salary-slip-content" className="space-y-6">
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
                  <p className="text-[11px] text-slate-500 font-mono mt-1">{selectedMonth}</p>
                </div>
              </div>

              {/* Teacher Info Table */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Employee</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{slipTeacher.teacher.name}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{slipTeacher.teacher.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Disbursement Date</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {slipTeacher.salary.paidDate ? new Date(slipTeacher.salary.paidDate).toLocaleDateString() : 'Recorded'}
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    Method: {slipTeacher.salary.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Monthly Attendance Breakdown in Slip */}
              <div className="border border-slate-200 rounded-xl p-3 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Monthly Attendance Record
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-800">
                    <span className="block font-bold">{slipTeacher.attendance.presentCount}</span>
                    <span className="text-[10px]">Presents</span>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg text-rose-800">
                    <span className="block font-bold">{slipTeacher.attendance.absentCount}</span>
                    <span className="text-[10px]">Absents</span>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-lg text-purple-800">
                    <span className="block font-bold">{slipTeacher.attendance.halfDayCount}</span>
                    <span className="text-[10px]">Half Leaves</span>
                  </div>
                  <div className="bg-sky-50 p-2 rounded-lg text-sky-800">
                    <span className="block font-bold">{slipTeacher.attendance.attendanceRate}%</span>
                    <span className="text-[10px]">Ratio</span>
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Base Salary</span>
                  <span className="font-mono font-bold text-slate-900">
                    PKR {slipTeacher.salary.baseSalary.toLocaleString()}
                  </span>
                </div>
                {slipTeacher.salary.bonus > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-emerald-700">
                    <span>Performance Bonus</span>
                    <span className="font-mono font-bold">
                      +PKR {slipTeacher.salary.bonus.toLocaleString()}
                    </span>
                  </div>
                )}
                {slipTeacher.salary.deductions > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-rose-700">
                    <span>Attendance Deductions</span>
                    <span className="font-mono font-bold">
                      -PKR {slipTeacher.salary.deductions.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2.5 border-t-2 border-slate-900 text-sm font-extrabold">
                  <span className="text-slate-900">Total Net Disbursed:</span>
                  <span className="font-mono text-emerald-700 text-base">
                    PKR {slipTeacher.salary.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Transaction / Notes */}
              {slipTeacher.salary.transactionId && (
                <p className="text-[11px] text-slate-500 font-mono">
                  Ref / Transaction ID: {slipTeacher.salary.transactionId}
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

            {/* Print and Close Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setSlipTeacher(null)}
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
                Print Voucher Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
