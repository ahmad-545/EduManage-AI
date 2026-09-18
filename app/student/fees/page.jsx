'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, Download, CheckCircle2, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { generateFeeReceiptPDF } from '../../../lib/pdfGenerator';

export default function StudentFeesPage() {
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/fees');
      const data = await res.json();
      setStudent(data.student);
      setFees(data.fees || []);
    } catch (err) {
      console.error('Failed to load fee history:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = fees
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const totalPending = fees
    .filter((f) => f.status === 'pending')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/student/dashboard"
          className="text-slate-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-sky-600" />
          My Tuition Fee History & Receipts
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Month-by-month billing statements, clearance status, and downloadable official payment receipts.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Settled Fees</span>
          <p className="text-xl font-bold text-emerald-600 font-mono mt-1">
            PKR {totalPaid.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Outstanding Overdue</span>
          <p className="text-xl font-bold text-rose-600 font-mono mt-1">
            PKR {totalPending.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Ledger Invoices</span>
          <p className="text-xl font-bold text-sky-700 font-mono mt-1">
            {fees.length} Invoices
          </p>
        </div>
      </div>

      {/* Fee History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-sky-50/50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Tuition Ledger Records
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Paid / Due Date</th>
                <th className="py-3 px-4 text-right">Official Receipt</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-2" />
                    Loading fee statements...
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No fee history recorded for this student.
                  </td>
                </tr>
              ) : (
                fees.map((f) => {
                  const isPaid = f.status === 'paid';

                  return (
                    <tr key={f._id} className="hover:bg-sky-50/30 transition">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {f.month}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        PKR {f.amount?.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                        {isPaid
                          ? f.paidDate
                            ? new Date(f.paidDate).toLocaleDateString('en-GB')
                            : 'Paid'
                          : f.dueDate
                          ? `Due: ${new Date(f.dueDate).toLocaleDateString('en-GB')}`
                          : 'Due upon issue'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isPaid ? (
                          <button
                            onClick={() => generateFeeReceiptPDF({ student, fee: f })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-semibold text-xs transition shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5 text-sky-600" />
                            Download PDF Receipt
                          </button>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-medium italic">
                            Clear at Accounts Office
                          </span>
                        )}
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
  );
}
