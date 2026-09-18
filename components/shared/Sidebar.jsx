'use client';

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
} from 'lucide-react';

export default function Sidebar({ role }) {
  const pathname = usePathname();

  const adminLinks = [
    { label: 'Dashboard Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Teachers', href: '/admin/teachers', icon: Users },
    { label: 'Pending Approvals', href: '/admin/teachers/pending', icon: UserCheck },
    { label: 'Students Directory', href: '/admin/students', icon: GraduationCap },
    { label: 'Classes & Subjects', href: '/admin/classes', icon: Layers },
    { label: 'Fee Management', href: '/admin/fees', icon: DollarSign },
    { label: 'AI Reports & Insights', href: '/admin/reports', icon: BrainCircuit },
  ];

  const teacherLinks = [
    { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'My Classes & Lectures', href: '/teacher/my-classes', icon: BookOpen },
    { label: 'Quizzes & Tests', href: '/teacher/quizzes', icon: Award },
    { label: 'Weekly Timetable', href: '/teacher/schedule', icon: Calendar },
  ];

  const studentLinks = [
    { label: 'Student Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 shadow-sm">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));

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
  );
}

