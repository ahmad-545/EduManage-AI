'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function PendingTeachersPage() {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/teachers?status=pending');
      const data = await res.json();
      setPendingTeachers(data.teachers || []);
    } catch (err) {
      console.error('Failed to load pending teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      setProcessingId(id);
      setFeedback({ type: '', text: '' });

      const res = await fetch(`/api/admin/teachers/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Operation failed' });
      } else {
        setFeedback({
          type: 'success',
          text: data.message || `Teacher has been ${action}d successfully.`,
        });
        // Remove from list
        setPendingTeachers((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network error: ' + err.message });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/teachers"
              className="text-slate-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Teachers
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Pending Teacher Registrations
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
              {pendingTeachers.length} Awaiting Review
            </span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Teachers who register online are blocked until approved by Super Admin.
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

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          Loading pending registrations...
        </div>
      ) : pendingTeachers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3 opacity-70" />
          <p className="font-bold text-slate-800 text-sm">All Clear! No Pending Applications.</p>
          <p className="text-slate-500 mt-1">
            All teacher signups have been reviewed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pendingTeachers.map((teacher) => {
            const isBusy = processingId === teacher._id;

            return (
              <div
                key={teacher._id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-base">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{teacher.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{teacher.email}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                    Pending
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp / Phone:
                    </span>
                    <span className="font-mono text-slate-900 font-medium">{teacher.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-600" /> Applied On:
                    </span>
                    <span className="text-slate-800">{new Date(teacher.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleAction(teacher._id, 'approve')}
                    disabled={isBusy}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve Teacher
                  </button>

                  <button
                    onClick={() => handleAction(teacher._id, 'reject')}
                    disabled={isBusy}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
