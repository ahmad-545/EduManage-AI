'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Filter,
  Search,
  Sparkles,
  AlertCircle,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import { generateFeeReceiptPDF } from '../../../lib/pdfGenerator';

export default function AdminFeesPage() {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({ totalCollected: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  // Payment Recording Modal
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, fee: null, method: 'Cash' });
  const [recordingPayment, setRecordingPayment] = useState(false);

  // AI WhatsApp Reminder Modal / State
  const [aiReminderModal, setAiReminderModal] = useState({
    isOpen: false,
    fee: null,
    reminderCount: 1,
    loading: false,
    draftMessage: '',
    result: null,
  });

  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchFees();
  }, [filterStatus]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      let url = '/api/admin/fees';
      if (filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setFees(data.fees || []);
      setStats(data.stats || { totalCollected: 0, totalPending: 0 });
    } catch (err) {
      console.error('Failed to load fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentModal.fee) return;

    try {
      setRecordingPayment(true);
      const res = await fetch('/api/admin/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record-payment',
          feeId: paymentModal.fee._id,
          paymentMethod: paymentModal.method,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: 'Payment recorded successfully!' });
        setPaymentModal({ isOpen: false, fee: null, method: 'Cash' });
        fetchFees();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to record payment' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleOpenAiReminder = async (fee) => {
    setAiReminderModal({
      isOpen: true,
      fee,
      reminderCount: 1,
      loading: true,
      draftMessage: '',
      result: null,
    });

    try {
      const res = await fetch('/api/ai/fee-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeId: fee._id,
          reminderCount: 1,
          directSend: false, // Draft preview first
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiReminderModal((prev) => ({
          ...prev,
          loading: false,
          draftMessage: data.draftMessage,
        }));
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to generate AI reminder' });
        setAiReminderModal((prev) => ({ ...prev, isOpen: false }));
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
      setAiReminderModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleSendWhatsAppReminder = async () => {
    if (!aiReminderModal.fee) return;

    try {
      setAiReminderModal((prev) => ({ ...prev, loading: true }));
      const res = await fetch('/api/ai/fee-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeId: aiReminderModal.fee._id,
          reminderCount: aiReminderModal.reminderCount,
          directSend: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiReminderModal((prev) => ({
          ...prev,
          loading: false,
          result: data,
        }));
        setFeedback({
          type: 'success',
          text: `WhatsApp reminder dispatched to ${data.parentPhone}!`,
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
      setAiReminderModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const filteredFees = fees.filter((f) => {
    const sName = f.studentId?.name?.toLowerCase() || '';
    const roll = f.studentId?.rollNumber?.toString() || '';
    const q = search.toLowerCase().trim();
    return !q || sName.includes(q) || roll.includes(q) || f.month?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Fee Collection & Financial Records
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Track student monthly dues, record tuition payments, issue official PDF vouchers, and send AI WhatsApp reminders.
          </p>
        </div>

        <Link
          href="/admin/fees/structure"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center gap-2 self-start md:self-auto"
        >
          <Layers className="w-4 h-4" />
          Generate Monthly Invoices
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Collected</span>
          <p className="text-xl font-bold text-emerald-600 font-mono mt-1">
            PKR {stats.totalCollected.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Outstanding Overdue</span>
          <p className="text-xl font-bold text-rose-600 font-mono mt-1">
            PKR {stats.totalPending.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Invoices</span>
          <p className="text-xl font-bold text-sky-700 font-mono mt-1">
            {fees.length}
          </p>
        </div>
      </div>

      {feedback.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5">
          {['all', 'pending', 'paid'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                filterStatus === status
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, roll #, month..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Fee Month</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-2" />
                    Loading fee records...
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const isPaid = fee.status === 'paid';
                  const student = fee.studentId || {};
                  const classObj = student.classId || {};

                  return (
                    <tr key={fee._id} className="hover:bg-sky-50/40 transition">
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900">{student.name || 'Unknown'}</span>
                          <span className="block text-[11px] text-slate-500 font-mono">
                            Roll #{student.rollNumber} • {student.parentPhone}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {classObj.className ? `${classObj.className} - ${classObj.section}` : `Sec ${student.section}`}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {fee.month}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        PKR {fee.amount?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPaid ? (
                            <button
                              onClick={() => generateFeeReceiptPDF({ student, fee })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-semibold text-[11px] transition shadow-xs"
                              title="Download PDF Payment Receipt"
                            >
                              <Download className="w-3 h-3 text-sky-600" />
                              <span>Receipt</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setPaymentModal({ isOpen: true, fee, method: 'Cash' })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition shadow-xs"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Record Payment</span>
                              </button>

                              <button
                                onClick={() => handleOpenAiReminder(fee)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold text-[11px] transition shadow-xs"
                                title="Draft Escalating AI WhatsApp Reminder"
                              >
                                <Sparkles className="w-3 h-3 text-teal-600" />
                                <span>AI Reminder</span>
                              </button>
                            </>
                          )}
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

      {/* Record Payment Modal */}
      {paymentModal.isOpen && paymentModal.fee && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900">Record Fee Collection</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs text-slate-700">
              <p><strong>Student:</strong> {paymentModal.fee.studentId?.name}</p>
              <p><strong>Fee Month:</strong> {paymentModal.fee.month}</p>
              <p><strong>Amount:</strong> PKR {paymentModal.fee.amount?.toLocaleString()}</p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentModal.method}
                  onChange={(e) => setPaymentModal({ ...paymentModal, method: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                >
                  <option value="Cash">Cash (Counter Deposit)</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Online Bank Transfer</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModal({ isOpen: false, fee: null, method: 'Cash' })}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                >
                  {recordingPayment ? 'Recording...' : 'Confirm Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI WhatsApp Reminder Modal */}
      {aiReminderModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Escalating AI WhatsApp Fee Reminder
                </h2>
                <p className="text-xs text-slate-500">
                  OpenAI drafts escalating reminders based on overdue duration.
                </p>
              </div>
            </div>

            {aiReminderModal.loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-3" />
                Connecting with AI and WhatsApp services...
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Target Parent: <strong className="text-slate-900">{aiReminderModal.fee?.studentId?.name} ({aiReminderModal.fee?.studentId?.parentPhone})</strong></span>
                    <span>Month: <strong className="text-teal-700">{aiReminderModal.fee?.month}</strong></span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Escalation Tier:
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setAiReminderModal((prev) => ({ ...prev, reminderCount: num }));
                          }}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            aiReminderModal.reminderCount === num
                              ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          Tier #{num} {num === 1 ? '(Polite)' : num === 2 ? '(Firm)' : '(Final Notice)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      WhatsApp Message Preview:
                    </label>
                    <textarea
                      value={aiReminderModal.draftMessage}
                      onChange={(e) =>
                        setAiReminderModal((prev) => ({ ...prev, draftMessage: e.target.value }))
                      }
                      rows={5}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAiReminderModal({ isOpen: false, fee: null, draftMessage: '', result: null })}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsAppReminder}
                    className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs shadow-xs flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send via WhatsApp
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
