import Link from 'next/link';
import {
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  Award,
  DollarSign,
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  CheckCircle2,
  CalendarCheck,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between relative">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                EduManage <span className="text-xs px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 font-semibold border border-sky-200 font-mono">CMS</span>
              </span>
              <span className="text-[11px] text-slate-500 block -mt-0.5">Academy Management System</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
            >
              Teacher Sign Up
            </Link>

            <Link
              href="/login"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          Clean & Simple CMS for Academies, Tuition Centers & Schools
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Effortless Academy Management, <br />
          <span className="text-sky-600">
            Powered by Smart Portals
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Clean, simple, and high-readability portals for Super Admins, Teachers, and Students. Featuring manual class & section inputs, multi-lecture teacher rosters, and printable student roll number slips & datesheets.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            Launch Unified Login Portal
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            Register as Teacher
          </Link>
        </div>

        {/* 3 Roles Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left w-full pt-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-sky-300 transition">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Super Admin</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simple interface to admit students by directly typing class & section, approve teachers, assign multi-lecture timetables, and monitor fees.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-emerald-300 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Teacher Portal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Classes grouped cohort-wise with clear lecture times. Easily handle multiple lectures per class with direct buttons for attendance and marks.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Student & Parent Portal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              View student profile, enrolled subjects with teacher name & email, subject attendance %, lecture timetable, datesheet, and printable roll number slips.
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Credential Dispatch
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" /> Exam Datesheet & Timetable
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-blue-600" /> Printable Official Roll Number Slip
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-200 text-center text-xs text-slate-500">
        EduManage AI • Academy & School Management CMS • Next.js App Router & MongoDB
      </footer>
    </div>
  );
}
