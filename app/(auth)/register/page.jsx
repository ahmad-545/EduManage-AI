'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { GraduationCap, User, Mail, Lock, Phone, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [demoLoadingRole, setDemoLoadingRole] = useState(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit registration');
        setLoading(false);
        return;
      }

      // Automatically sign the educator in immediately!
      const signInRes = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (!signInRes?.error) {
        router.push('/teacher/dashboard');
        router.refresh();
      } else {
        setRegisteredSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg('An unexpected network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async (roleEmail, rolePass, roleKey, targetRoute) => {
    setDemoLoadingRole(roleKey);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: roleEmail,
        password: rolePass,
      });
      if (!res?.error) {
        router.push(targetRoute);
        router.refresh();
      }
    } catch (err) {
      console.error('Instant demo login failed:', err);
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative">
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600 text-white shadow-sm mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">EduManage CMS</h1>
          <p className="text-slate-500 text-xs mt-0.5">Educator Application & Registration</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {registeredSuccess ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Registration Complete!</h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Your educator account is <span className="text-emerald-700 font-bold uppercase">Active</span>. You can now access the Teacher Portal and start managing classes immediately.
              </p>

              <Link
                href="/teacher/dashboard"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition shadow-sm"
              >
                Go to Teacher Dashboard
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">Faculty Registration</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign up for an educator account with instant demo activation.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name & Title
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sir Muhammad Usman"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Official / Personal Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="teacher@academy.edu.pk"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    WhatsApp / Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password (min. 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition duration-150 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Educator Application
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-sky-600 hover:text-sky-700 transition"
                  >
                    Go to Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Quick Demo Accounts Helper for Live Presentation */}
        <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
              Live Demo: Instant 1-Click Access
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              disabled={Boolean(demoLoadingRole)}
              onClick={() => handleInstantDemoLogin('admin@edumanage.pk', 'AdminPass123!', 'admin', '/admin/dashboard')}
              className="p-2.5 bg-slate-50 hover:bg-sky-50 text-slate-700 rounded-xl border border-slate-200 transition text-center disabled:opacity-60"
            >
              <p className="font-bold text-sky-700 text-xs">Super Admin</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {demoLoadingRole === 'admin' ? 'Logging in...' : 'Enter Admin'}
              </p>
            </button>

            <button
              type="button"
              disabled={Boolean(demoLoadingRole)}
              onClick={() => handleInstantDemoLogin('teacher.ahmed@edumanage.pk', 'TeacherPass123!', 'teacher', '/teacher/dashboard')}
              className="p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 rounded-xl border border-slate-200 transition text-center disabled:opacity-60"
            >
              <p className="font-bold text-emerald-700 text-xs">Faculty</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {demoLoadingRole === 'teacher' ? 'Logging in...' : 'Enter Teacher'}
              </p>
            </button>

            <button
              type="button"
              disabled={Boolean(demoLoadingRole)}
              onClick={() => handleInstantDemoLogin('10a-001@edumanage.pk', 'StudentPass123!', 'student', '/student/dashboard')}
              className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 rounded-xl border border-slate-200 transition text-center disabled:opacity-60"
            >
              <p className="font-bold text-indigo-700 text-xs">Student</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {demoLoadingRole === 'student' ? 'Logging in...' : 'Enter Student'}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
