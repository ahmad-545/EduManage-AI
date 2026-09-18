'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setIsPendingApproval(false);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        if (result.error.includes('PENDING_APPROVAL') || result.error.includes('pending approval')) {
          setIsPendingApproval(true);
          setErrorMsg('Your teacher registration is currently pending review and approval by the Super Admin. You will be able to log in once your account has been approved and assigned to classes.');
        } else {
          setErrorMsg(result.error || 'Invalid email or password. Please check your credentials.');
        }
        setLoading(false);
        return;
      }

      // Success: Fetch session to determine role redirect
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (session?.user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (session?.user?.role === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (session?.user?.role === 'student') {
        router.push('/student/dashboard');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      setErrorMsg('An unexpected error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  // Quick fill helper for testing roles
  const fillCredentials = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMsg('');
    setIsPendingApproval(false);
  };

  return (
    <div className="w-full max-w-md z-10">
      {/* Brand header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600 text-white shadow-sm mb-3">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">EduManage CMS</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Academy & School Management System
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">Sign In to Your Account</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            One unified portal for Super Admins, Teachers, and Students.
          </p>
        </div>

        {/* Pending Approval Banner */}
        {isPendingApproval && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-900 mb-0.5">Registration Pending Approval</strong>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && !isPendingApproval && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email / Student Login ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@edumanage.pk or 10a-001@edumanage.pk"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Teacher registration link */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Are you an educator?{' '}
            <Link
              href="/register"
              className="font-semibold text-sky-600 hover:text-sky-700 transition"
            >
              Register as Teacher
            </Link>
          </p>
        </div>
      </div>

      {/* Quick Demo Accounts Helper */}
      <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
          Demo Accounts (One-Click Auto Fill)
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillCredentials('admin@edumanage.pk', 'AdminPass123!')}
            className="p-2 bg-slate-50 hover:bg-sky-50 text-slate-700 rounded-xl border border-slate-200 transition text-left flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-sky-700">Super Admin</p>
              <p className="text-[10px] text-slate-500">Full control</p>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 opacity-60" />
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('teacher.ahmed@edumanage.pk', 'TeacherPass123!')}
            className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 rounded-xl border border-slate-200 transition text-left flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-emerald-700">Active Teacher</p>
              <p className="text-[10px] text-slate-500">Assigned Classes</p>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 opacity-60" />
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('10a-001@edumanage.pk', 'StudentPass123!')}
            className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-700 rounded-xl border border-slate-200 transition text-left flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-blue-700">Student</p>
              <p className="text-[10px] text-slate-500">Class 10-A</p>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 opacity-60" />
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('teacher.sana@edumanage.pk', 'TeacherPass123!')}
            className="p-2 bg-slate-50 hover:bg-amber-50 text-slate-700 rounded-xl border border-slate-200 transition text-left flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-amber-700">Pending Teacher</p>
              <p className="text-[10px] text-slate-500">Test rejection</p>
            </div>
            <Clock className="w-3.5 h-3.5 text-amber-600 opacity-60" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          Loading sign-in portal...
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
