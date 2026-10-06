'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { GraduationCap, LogOut, User, ShieldCheck, Sparkles, Bell } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <ShieldCheck className="w-3 h-3 text-sky-600" /> Super Admin
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Teacher / Faculty
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-300">
            <GraduationCap className="w-3 h-3 text-sky-600" /> Student
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shadow-sm">
      {/* Brand logo & name */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm shadow-sky-600/30 group-hover:bg-sky-700 transition">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            EduManage <span className="text-xs px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 font-semibold border border-sky-200 font-mono">CMS</span>
          </span>
          <span className="text-[11px] text-slate-500 block -mt-0.5">School & Academy Management System</span>
        </div>
      </Link>

      {/* User profile & actions */}
      {user && (
        <div className="flex items-center gap-3 md:gap-4">
          {user.role === 'student' ? (
            <Link
              href="/student/profile"
              className="hidden sm:flex flex-col items-end text-right hover:opacity-80 transition group"
              title="View Student Profile"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 group-hover:text-sky-600 transition">{user.name}</span>
                {getRoleBadge(user.role)}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">{user.email}</span>
            </Link>
          ) : (
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                {getRoleBadge(user.role)}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">{user.email}</span>
            </div>
          )}

          <div className="h-7 w-px bg-slate-200 hidden sm:block" />

          {user.role === 'student' && (
            <Link
              href="/student/profile"
              title="My Student Profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-medium transition duration-150"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
}

