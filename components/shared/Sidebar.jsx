'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calendar,
  ClipboardCheck,
  Award,
  HelpCircle,
  FileSpreadsheet,
  BrainCircuit,
  Sparkles,
  Layers,
  FileText,
  User,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const adminLinks = [
    { label: 'Dashboard Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Teachers', href: '/admin/teachers', icon: Users },
    { label: 'Teacher Attendance', href: '/admin/teachers/attendance', icon: ClipboardCheck },
    { label: 'Teacher Salaries', href: '/admin/teachers/salaries', icon: DollarSign },
    { label: 'Pending Approvals', href: '/admin/teachers/pending', icon: UserCheck },
    { label: 'Students Directory', href: '/admin/students', icon: GraduationCap },
    { label: 'Classes & Subjects', href: '/admin/classes', icon: Layers },
    { label: 'Fee Management', href: '/admin/fees', icon: DollarSign },
    { label: 'AI Reports & Insights', href: '/admin/reports', icon: BrainCircuit },
  ];

  const teacherLinks = [
    { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'My Classes & Lectures', href: '/teacher/my-classes', icon: BookOpen },
    { label: 'My Attendance Log', href: '/teacher/attendance-status', icon: ClipboardCheck },
    { label: 'Quizzes & Tests', href: '/teacher/quizzes', icon: Award },
    { label: 'Weekly Timetable', href: '/teacher/schedule', icon: Calendar },
  ];

  const studentLinks = [
    { label: 'Student Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Profile & Account', href: '/student/profile', icon: User },
    { label: 'Lecture Timetable', href: '/student/schedule', icon: Calendar },
    { label: 'Exam Datesheet', href: '/student/datesheet', icon: FileSpreadsheet },
    { label: 'Roll Number Slip', href: '/student/roll-number-slip', icon: FileText },
    { label: 'My Grade Book', href: '/student/grades', icon: Award },
    { label: 'Fee History & Receipts', href: '/student/fees', icon: DollarSign },
  ];

  let navLinks = [];
  if (role === 'admin') navLinks = adminLinks;
  else if (role === 'teacher') navLinks = teacherLinks;
  else if (role === 'student') navLinks = studentLinks;

  // Find active link for mobile indicator
  const activeItem = navLinks.find(
    (item) => pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href))
  ) || navLinks[0];

  const ActiveIcon = activeItem?.icon || LayoutDashboard;

  return (
    <>
      {/* Mobile Top Navigation Sub-Bar (Sticky under Navbar on screens < md) */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xs sticky top-16 z-20">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4 text-slate-600" />
          <span>Menu</span>
        </button>

        {activeItem && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <ActiveIcon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate max-w-[170px]">{activeItem.label}</span>
          </div>
        )}
      </div>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl p-4 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">EduManage CMS</p>
                    <p className="text-[10px] text-slate-500 capitalize">{role} Navigation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div>
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Main Navigation
                </p>
                <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
                  {navLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                          isActive
                            ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`}
                        />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-500" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-100">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate font-medium">EduManage CMS • Responsive</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar (md and up) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex-col justify-between shrink-0 shadow-sm sticky top-16 h-[calc(100vh-4rem)]">
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Main Navigation
            </p>
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                      isActive
                        ? 'bg-sky-50 text-sky-800 font-semibold border border-sky-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info pill */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="truncate font-medium">EduManage CMS • v2.6</span>
        </div>
      </aside>
    </>
  );
}

