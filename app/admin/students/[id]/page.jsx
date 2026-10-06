'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Edit2,
  Plus,
  Printer,
  Send,
  ExternalLink,
  FileText,
  BookOpen,
  Award,
  AlertCircle,
  X,
  CreditCard,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Check,
  Receipt,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { generateFeeReceiptPDF } from '@/lib/pdfGenerator';

export default function StudentProfileDossierPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fees'); // 'fees' | 'attendance' | 'academic' | 'schedule' | 'account'
  const [toast, setToast] = useState('');

  // Payment Modal State
  const [payModal, setPayModal] = useState({ isOpen: false, fee: null, method: 'Cash', txnId: '' });
  const [payLoading, setPayLoading] = useState(false);

  // New Fee Voucher Modal State
  const [newFeeModal, setNewFeeModal] = useState({
    isOpen: false,
    month: '',
    amount: 5000,
    dueDate: '',
    status: 'pending',
    paymentMethod: 'Cash',
  });
  const [newFeeLoading, setNewFeeLoading] = useState(false);

  // Reset Password Modal State
  const [pwdModal, setPwdModal] = useState({ isOpen: false, newPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Printable Challan Modal State
  const [printChallanModal, setPrintChallanModal] = useState({ isOpen: false, fee: null });

  useEffect(() => {
    if (studentId) {
      loadStudentDossier();
    }
  }, [studentId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const loadStudentDossier = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/students/${studentId}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load student profile');
      }
      setData(json);

      // Pre-populate new fee modal defaults
      const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
      setNewFeeModal((prev) => ({
        ...prev,
        month: currentMonth,
        amount: json.student?.monthlyFee || 5000,
      }));
    } catch (err) {
      console.error('Failed to load student dossier:', err);
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payModal.fee) return;
    setPayLoading(true);

    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pay-fee',
          feeId: payModal.fee._id,
          paymentMethod: payModal.method,
          transactionId: payModal.txnId || `TXN-${Date.now().toString().slice(-6)}`,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to record payment');

      showToast(`Payment of PKR ${(payModal.fee.amount || 0).toLocaleString()} recorded successfully!`);
      setPayModal({ isOpen: false, fee: null, method: 'Cash', txnId: '' });
      loadStudentDossier();
    } catch (err) {
      showToast(err.message);
    } finally {
      setPayLoading(false);
    }
  };

  const handleCreateFeeVoucher = async (e) => {
    e.preventDefault();
    setNewFeeLoading(true);

    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-fee',
          month: newFeeModal.month,
          amount: newFeeModal.amount,
          dueDate: newFeeModal.dueDate,
          status: newFeeModal.status,
          paymentMethod: newFeeModal.paymentMethod,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create fee voucher');

      showToast(`Fee voucher for ${newFeeModal.month} generated successfully!`);
      setNewFeeModal((prev) => ({ ...prev, isOpen: false }));
      loadStudentDossier();
    } catch (err) {
      showToast(err.message);
    } finally {
      setNewFeeLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!pwdModal.newPassword || pwdModal.newPassword.trim().length < 4) {
      showToast('Password must be at least 4 characters');
      return;
    }
    setPwdLoading(true);

    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: pwdModal.newPassword.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to reset password');

      showToast('Student portal password reset successfully!');
      setPwdModal({ isOpen: false, newPassword: '' });
    } catch (err) {
      showToast(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDownloadPDF = (fee) => {
    try {
      generateFeeReceiptPDF({
        student: data.student,
        fee,
        schoolName: process.env.NEXT_PUBLIC_SCHOOL_NAME || 'EduManage AI Academy',
      });
      showToast('Receipt PDF generated successfully!');
    } catch (err) {
      console.error('PDF error:', err);
      showToast('Failed to generate PDF: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs">
        <div className="w-8 h-8 border-3 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
        Loading complete student 360° dossier...
      </div>
    );
  }

  if (!data || !data.student) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-60 text-slate-400" />
        Student record not found.
        <div className="mt-4">
          <Link href="/admin/students" className="text-sky-600 font-semibold hover:underline">
            Back to Students Directory
          </Link>
        </div>
      </div>
    );
  }

  const { student, fees = [], feeStats = {}, attendance = [], attendanceStats = {}, grades = [], avgGradePct, quizResults = [], timetable = [] } = data;

  const cleanPhone = (student.parentPhone || '').replace(/[^\d+]/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}` : null;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/admin/students"
          className="text-slate-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Students Directory
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Dossier</span>
          </button>

          <Link
            href={`/admin/students/${student._id}/edit`}
            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Student 360° Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-100/50 via-transparent to-transparent pointer-events-none rounded-bl-full" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-sky-500/20 shrink-0">
              {student.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                  Roll #{String(student.rollNumber).padStart(3, '0')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {student.classId?.className || 'Class'} - Section {student.section || student.classId?.section || 'A'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email}
                </span>

                <span className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {student.parentPhone}
                </span>

                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Admitted: {new Date(student.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Parent</span>
                <ExternalLink className="w-3 h-3 text-emerald-500 ml-0.5" />
              </a>
            )}

            <button
              onClick={() => setPwdModal({ isOpen: true, newPassword: '' })}
              className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Monthly Tuition Fee Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Monthly Tuition Fee</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            PKR {(student.monthlyFee || 5000).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Base monthly billing rate</p>
        </div>

        {/* Current Month Fee Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Current Month Status</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              feeStats.currentMonthFee?.status === 'paid'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600'
            }`}>
              {feeStats.currentMonthFee?.status === 'paid' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
          </div>
          <div className="text-xl font-bold font-mono">
            {feeStats.currentMonthFee?.status === 'paid' ? (
              <span className="text-emerald-700">PAID</span>
            ) : feeStats.currentMonthFee?.status === 'pending' ? (
              <span className="text-amber-700">PENDING</span>
            ) : (
              <span className="text-slate-500 text-sm">NO INVOICE</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{feeStats.currentMonth || 'This Month'}</p>
        </div>

        {/* Total Fee Ledger */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Ledger Outstanding</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-700 font-mono">
            PKR {(feeStats.totalPending || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Paid: PKR {(feeStats.totalPaid || 0).toLocaleString()}
          </p>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Attendance Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono">
            {attendanceStats.rate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {attendanceStats.present} Present / {attendanceStats.total} Sessions
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
            activeTab === 'fees'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Fee Ledger & Invoices ({fees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
            activeTab === 'attendance'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Attendance Records ({attendance.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
            activeTab === 'academic'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Exams & Quizzes ({grades.length + quizResults.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
            activeTab === 'schedule'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Class Timetable ({timetable.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
            activeTab === 'account'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Credentials & Security</span>
        </button>
      </div>

      {/* TAB 1: Fee Ledger & Invoices */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Fee Ledger & Invoices</h3>
              <p className="text-xs text-slate-500">
                Track payments, generate custom challans, and issue official stamped receipts.
              </p>
            </div>

            <button
              onClick={() => setNewFeeModal((prev) => ({ ...prev, isOpen: true }))}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Fee Invoice</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Fee Month</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Due / Paid Date</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Transaction / Receipt #</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {fees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                        <p className="font-medium">No fee invoices recorded for this student yet.</p>
                      </td>
                    </tr>
                  ) : (
                    fees.map((f) => {
                      const isPaid = f.status === 'paid';

                      return (
                        <tr key={f._id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                            {f.month}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            PKR {(f.amount || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {isPaid && f.paidDate ? (
                              <span className="text-emerald-700 font-medium">
                                Paid: {new Date(f.paidDate).toLocaleDateString('en-GB')}
                              </span>
                            ) : f.dueDate ? (
                              <span>Due: {new Date(f.dueDate).toLocaleDateString('en-GB')}</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 text-[11px]">
                            {f.paymentMethod || 'Cash'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                            {f.transactionId || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPayModal({
                                      isOpen: true,
                                      fee: f,
                                      method: 'Cash',
                                      txnId: `TXN-${Date.now().toString().slice(-6)}`,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition shadow-2xs"
                                >
                                  Mark Paid
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDownloadPDF(f)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 transition"
                                title="Download PDF Receipt"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setPrintChallanModal({ isOpen: true, fee: f })}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                                title="Print Voucher Challan"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Attendance Records */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Total Classes</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">{attendanceStats.total}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Presents</span>
              <div className="text-xl font-bold text-emerald-700 font-mono mt-1">{attendanceStats.present}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Absents</span>
              <div className="text-xl font-bold text-rose-700 font-mono mt-1">{attendanceStats.absent}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Lates</span>
              <div className="text-xl font-bold text-amber-700 font-mono mt-1">{attendanceStats.late}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center text-slate-500">
                        No attendance recorded yet.
                      </td>
                    </tr>
                  ) : (
                    attendance.map((att) => (
                      <tr key={att._id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">{att.date}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {att.subjectId?.subjectName || 'General'}
                        </td>
                        <td className="py-3 px-4">
                          {att.status === 'present' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Present
                            </span>
                          ) : att.status === 'late' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" /> Late
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" /> Absent
                            </span>
                          )}
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

      {/* TAB 3: Academic Performance */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          {/* Exam Grades Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-600" />
              <span>Examination Results & Report Card</span>
              {avgGradePct !== null && (
                <span className="ml-auto text-xs font-mono font-bold bg-sky-50 text-sky-800 px-2.5 py-0.5 rounded-lg border border-sky-200">
                  Average: {avgGradePct}%
                </span>
              )}
            </h3>

            {grades.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No examination grades recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Exam Name</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Marks Obtained</th>
                      <th className="py-2.5 px-3">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {grades.map((g) => {
                      const pct = g.totalMarks ? Math.round((g.marks / g.totalMarks) * 100) : 0;
                      return (
                        <tr key={g._id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{g.examType}</td>
                          <td className="py-2.5 px-3">{g.subjectId?.subjectName || 'Subject'}</td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            {g.marks} / {g.totalMarks}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-bold text-sky-700">{pct}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AI Quizzes & Test Results */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Quizzes & Pop-Tests</span>
            </h3>

            {quizResults.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No quiz submissions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Quiz Title</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quizResults.map((qr) => (
                      <tr key={qr._id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {qr.quizId?.title || 'Quiz'}
                        </td>
                        <td className="py-2.5 px-3">{qr.quizId?.subjectId?.subjectName || 'Subject'}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-sky-700">
                          {qr.marksObtained} / {qr.quizId?.totalMarks || 20}
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

      {/* TAB 4: Weekly Timetable */}
      {activeTab === 'schedule' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Weekly Timetable Schedule for {student.classId?.className} - {student.section}</span>
            </h3>
          </div>

          {timetable.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No weekly timetable slots assigned to this class yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {timetable.map((slot) => (
                <div key={slot._id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-sky-700">{slot.day}</span>
                    <span className="text-[11px] font-mono font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {slot.timeSlot}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-slate-900">
                    {slot.teacherClassId?.subjectId?.subjectName || 'Subject'}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Teacher: {slot.teacherClassId?.teacherId?.name || 'TBA'}</span>
                    <span className="font-mono text-[10px] text-slate-400">{slot.room || 'Room 101'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Credentials & Security */}
      {activeTab === 'account' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-xl space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Portal Credentials & Security Settings</span>
          </h3>

          <div className="space-y-3 font-mono text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="font-sans text-slate-500">Student Portal Login:</span>
              <span className="font-bold text-sky-800 select-all">{student.email}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="font-sans text-slate-500">Parent WhatsApp Contact:</span>
              <span className="font-bold text-slate-800 select-all">{student.parentPhone}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="font-sans text-slate-500">Password Status:</span>
              <span className="text-amber-700 font-semibold font-sans">
                {student.mustChangePassword ? 'Temporary / Must Change' : 'User Established'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              As Super Admin, you can directly override and set a new password for this student below.
            </span>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Set New Portal Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={pwdModal.newPassword}
                onChange={(e) => setPwdModal({ ...pwdModal, newPassword: e.target.value })}
                placeholder="Type new password (e.g. Std987!)"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={pwdLoading}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition disabled:opacity-50"
              >
                {pwdLoading ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Record Fee Payment */}
      {payModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setPayModal({ isOpen: false, fee: null, method: 'Cash', txnId: '' })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Fee Payment</h3>
                <p className="text-xs text-slate-500">
                  {payModal.fee?.month} — PKR {(payModal.fee?.amount || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={payModal.method}
                  onChange={(e) => setPayModal({ ...payModal, method: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="Bank Transfer">Bank Transfer / Online</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction / Receipt Number
                </label>
                <input
                  type="text"
                  value={payModal.txnId}
                  onChange={(e) => setPayModal({ ...payModal, txnId: e.target.value })}
                  placeholder="e.g. TXN-123456"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModal({ isOpen: false, fee: null, method: 'Cash', txnId: '' })}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-60"
                >
                  {payLoading ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Generate New Fee Invoice */}
      {newFeeModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setNewFeeModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Generate Fee Invoice</h3>
                <p className="text-xs text-slate-500">Create a monthly tuition challan for {student.name}</p>
              </div>
            </div>

            <form onSubmit={handleCreateFeeVoucher} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Month & Year
                </label>
                <input
                  type="text"
                  required
                  value={newFeeModal.month}
                  onChange={(e) => setNewFeeModal({ ...newFeeModal, month: e.target.value })}
                  placeholder="e.g. November 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice Amount (PKR)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newFeeModal.amount}
                  onChange={(e) => setNewFeeModal({ ...newFeeModal, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={newFeeModal.status}
                  onChange={(e) => setNewFeeModal({ ...newFeeModal, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="pending">Pending (Unpaid Challan)</option>
                  <option value="paid">Paid (Immediate Payment)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewFeeModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newFeeLoading}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-60"
                >
                  {newFeeLoading ? 'Generating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Printable Fee Challan Voucher */}
      {printChallanModal.isOpen && printChallanModal.fee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 relative print:m-0 print:p-0 print:shadow-none print:border-none">
            <button
              onClick={() => setPrintChallanModal({ isOpen: false, fee: null })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Voucher Template */}
            <div className="space-y-4 border-2 border-dashed border-slate-300 p-5 rounded-2xl">
              <div className="text-center pb-3 border-b border-slate-200">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {process.env.NEXT_PUBLIC_SCHOOL_NAME || 'EduManage AI Academy'}
                </h2>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
                  Official Student Fee Challan
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name:</span>
                  <span className="font-bold text-slate-900">{student.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Roll # & Class:</span>
                  <span className="font-bold text-slate-900">
                    #{String(student.rollNumber).padStart(3, '0')} ({student.classId?.className}-{student.section})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Fee Month:</span>
                  <span className="font-bold text-slate-900">{printChallanModal.fee.month}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status:</span>
                  <span className={`font-bold ${printChallanModal.fee.status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {printChallanModal.fee.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700">Total Payable Amount:</span>
                <span className="font-mono font-extrabold text-base text-slate-900">
                  PKR {(printChallanModal.fee.amount || 0).toLocaleString()}
                </span>
              </div>

              <div className="pt-6 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200">
                <span>Authorized Signatory</span>
                <span>Accountant Stamp</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 print:hidden">
              <button
                type="button"
                onClick={() => setPrintChallanModal({ isOpen: false, fee: null })}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
