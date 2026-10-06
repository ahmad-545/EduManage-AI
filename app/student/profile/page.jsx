'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  DollarSign,
  CheckCircle2,
  Clock,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Send,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Receipt,
  FileText,
  Award,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function StudentProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'fees' | 'security' | 'forgot-pwd'
  const [toast, setToast] = useState('');

  // Change Password Form State
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState({ type: '', text: '' });

  // Copy helpers
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/profile');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load profile');
      setData(json);
    } catch (err) {
      console.error('Failed to load student profile:', err);
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdFeedback({ type: '', text: '' });

    if (pwdForm.newPassword.length < 6) {
      setPwdFeedback({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdFeedback({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setPwdLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update password');

      setPwdFeedback({ type: 'success', text: 'Your portal password has been updated successfully!' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully!');
      fetchProfile();
    } catch (err) {
      setPwdFeedback({ type: 'error', text: err.message });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs">
        <div className="w-8 h-8 border-3 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
        Loading your student profile and credentials...
      </div>
    );
  }

  if (!data || !data.student) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-60 text-slate-400" />
        Unable to load your profile. Please try logging in again.
      </div>
    );
  }

  const { student, feeStats = {}, attendanceStats = {}, academicStats = {}, supportInfo = {} } = data;

  const admissionDateFormatted = student.admissionDate
    ? new Date(student.admissionDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Session 2026';

  const isCurrentFeePaid = feeStats.currentMonthFee?.status === 'paid';

  // Format pre-filled WhatsApp link to Super Admin for Forgot Password
  const cleanAdminPhone = (supportInfo.adminWhatsApp || '+923008887766').replace(/[^\d+]/g, '').replace('+', '');
  const forgotMsg = `Assalamu Alaikum,\n\nI forgot my student portal password.\n- Student Name: ${student.name}\n- Roll Number: #${student.rollNumber}\n- Class: ${student.className} - Section ${student.section}\n- Login ID: ${student.email}\n- Parent WhatsApp: ${student.parentPhone}\n\nPlease help me reset my account password. Thank you!`;
  const adminWhatsAppUrl = `https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent(forgotMsg)}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner & Identity Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-sky-100/60 via-transparent to-transparent pointer-events-none rounded-bl-full" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-md shadow-sky-500/20 shrink-0">
              {student.name.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {student.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                  Roll #{String(student.rollNumber).padStart(3, '0')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Enrolled Active
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900">{student.className} - Section {student.section}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Admitted: {admissionDateFormatted}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('security')}
              className="flex-1 sm:flex-none px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>

            <button
              onClick={() => setActiveTab('forgot-pwd')}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Forgot Password?</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Enrolled Class */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Enrolled Class</span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {student.className}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Section {student.section}</p>
        </div>

        {/* Date of Admission */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Date of Admission</span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {new Date(student.admissionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Official Enrollment</p>
        </div>

        {/* Monthly Tuition Fee */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Monthly Tuition Fee</span>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">
            PKR {student.monthlyFee.toLocaleString()}
          </div>
          <div className="mt-0.5">
            {isCurrentFeePaid ? (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> {feeStats.currentMonth}: Paid
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> {feeStats.currentMonth}: Pending
              </span>
            )}
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Attendance Rate</span>
          <div className="text-lg font-bold text-emerald-700 font-mono mt-1">
            {attendanceStats.rate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {attendanceStats.present} Present / {attendanceStats.total} Sessions
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('identity')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'identity'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Profile & Info</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'fees'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Fee Ledger & Status ({feeStats.allInvoices?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Change Password</span>
        </button>

        <button
          onClick={() => setActiveTab('forgot-pwd')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'forgot-pwd'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Forgot Password Recovery</span>
        </button>
      </div>

      {/* TAB 1: Student Identity & Academic Profile */}
      {activeTab === 'identity' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              <span>Official Student Record</span>
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="font-bold text-slate-900">{student.name}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Class Roll Number:</span>
                <span className="font-mono font-bold text-sky-700">
                  #{String(student.rollNumber).padStart(3, '0')}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Class & Section:</span>
                <span className="font-semibold text-slate-900">
                  {student.className} — Section {student.section}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Date of Admission:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {admissionDateFormatted}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Portal Login ID / Email:</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-sky-800 font-bold">{student.email}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(student.email)}
                    className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Parent WhatsApp / Phone:</span>
                <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {student.parentPhone}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Monthly Tuition Fee:</span>
                <span className="font-mono font-bold text-slate-900">
                  PKR {student.monthlyFee.toLocaleString()}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Admission Fee Paid:</span>
                <span className="font-mono text-slate-700">
                  PKR {student.admissionFee.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & Academy Card */}
          <div className="space-y-4">
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sky-800 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Student Quick Actions</span>
              </div>
              <p className="text-[11px] text-sky-900/80 leading-relaxed">
                Access your examination schedule, printable roll number slip, or review fee slips anytime.
              </p>
              <div className="space-y-2 pt-1">
                <Link
                  href="/student/schedule"
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-sky-100/50 text-slate-800 text-xs font-semibold border border-sky-200 flex items-center justify-between transition"
                >
                  <span>Class Timetable</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/student/roll-number-slip"
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-sky-100/50 text-slate-800 text-xs font-semibold border border-sky-200 flex items-center justify-between transition"
                >
                  <span>Roll Number Slip</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/student/fees"
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-sky-100/50 text-slate-800 text-xs font-semibold border border-sky-200 flex items-center justify-between transition"
                >
                  <span>Fee Vouchers & Receipts</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Account Security Status</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {student.mustChangePassword
                  ? 'Your account currently has a temporary password. Please set a custom password.'
                  : 'Your portal password is active and secured.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="mt-2 text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <span>Manage Security</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Fee Ledger & Status */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fee History & Invoices</h3>
              <p className="text-xs text-slate-500">
                Base Fee: PKR {student.monthlyFee.toLocaleString()} / month • Total Paid: PKR {feeStats.totalPaid.toLocaleString()}
              </p>
            </div>
            <Link
              href="/student/fees"
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Fee Portal</span>
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Billing Month</th>
                    <th className="py-3 px-4">Invoice Amount</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Receipt #</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {!feeStats.allInvoices || feeStats.allInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No fee invoices recorded yet.
                      </td>
                    </tr>
                  ) : (
                    feeStats.allInvoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{inv.month}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          PKR {(inv.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          {inv.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {inv.paidDate ? new Date(inv.paidDate).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {inv.transactionId || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Change Password */}
      {activeTab === 'security' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Portal Password</h3>
              <p className="text-xs text-slate-500">Ensure your new password is at least 6 characters</p>
            </div>
          </div>

          {pwdFeedback.text && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                pwdFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {pwdFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{pwdFeedback.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPwd ? 'text' : 'password'}
                  required
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Password (Minimum 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  required
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={pwdForm.confirmPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                placeholder="Re-type new password"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {pwdLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password Now</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setActiveTab('forgot-pwd')}
              className="text-xs text-slate-500 hover:text-sky-600 font-medium"
            >
              Forgot your current password? Click here for recovery assistance
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Forgot Password Recovery Assistance */}
      {activeTab === 'forgot-pwd' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Forgot Password Recovery Assistance</h3>
              <p className="text-xs text-slate-500">Official procedures for resetting your student account</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-700">
            <div className="flex items-start gap-2.5 font-medium text-slate-900">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>How Student Account Passwords Work:</span>
            </div>
            <p className="text-slate-600">
              Your student login credentials (<code className="font-mono text-sky-700 font-semibold">{student.email}</code>) are official institutional credentials managed by <strong>{supportInfo.schoolName}</strong> and tied to your registered Parent WhatsApp mobile number:
            </p>
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between font-mono">
              <span className="text-slate-500 font-sans">Registered Parent WhatsApp:</span>
              <span className="font-bold text-emerald-700">{student.parentPhone}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Instant Recovery Options:
            </h4>

            {/* Option 1: WhatsApp Super Admin */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  Option 1: Contact Academy Admin via WhatsApp
                </span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Send a pre-formatted reset request with your Roll #{student.rollNumber} directly to the administration.
                </p>
              </div>

              <a
                href={adminWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shadow-xs"
              >
                <span>WhatsApp Admin</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>

            {/* Option 2: Visit Campus Admin Desk */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  Option 2: Campus Administrative Counter
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Visit the school administration desk. The Super Admin can verify your identity and immediately set a new password on your profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
