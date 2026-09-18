'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Printer,
  ArrowLeft,
  GraduationCap,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Award,
} from 'lucide-react';

export default function RollNumberSlipPage() {
  const [data, setData] = useState({ student: null, subjects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/my-data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load roll number slip:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const student = data.student;
  const subjects = data.subjects || [];

  // Generate examination dates starting from next Monday
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + ((1 + 7 - baseDate.getDay()) % 7 || 7));

  const examDatesheet = subjects.map((subj, index) => {
    const examDate = new Date(baseDate);
    examDate.setDate(baseDate.getDate() + index * 2);
    return {
      id: subj.subjectId,
      subjectName: subj.subjectName,
      date: examDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      day: examDate.toLocaleDateString('en-GB', { weekday: 'long' }),
      time: '09:00 AM - 12:00 PM',
      room: `Hall ${String.fromCharCode(65 + (index % 3))}`,
    };
  });

  const admissionDateFormatted = student?.admissionDate
    ? new Date(student.admissionDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '15-Aug-2025';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Actions (hidden on print) */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/student/dashboard"
          className="text-slate-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF Slip
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          Preparing official roll number slip...
        </div>
      ) : (
        /* Printable Roll Number Slip Document */
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-8 shadow-md space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Institution Header */}
          <div className="flex items-center justify-between pb-5 border-b-2 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                  EduManage Academy of Sciences
                </h1>
                <p className="text-xs text-slate-600">
                  Board of Intermediate & Secondary Examinations / Academy Division
                </p>
                <p className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider mt-0.5">
                  Official Examination Roll Number Slip • Session 2026
                </p>
              </div>
            </div>

            {/* Official Badge */}
            <div className="text-right hidden sm:block">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                VERIFIED SLIP
              </span>
              <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                Issued on: {new Date().toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>

          {/* Student Candidate Bio Block */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium block">Candidate Name</span>
              <p className="text-sm font-bold text-slate-900">{student?.name || '—'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium block">Roll Number</span>
              <p className="text-sm font-mono font-extrabold text-sky-700">
                #{String(student?.rollNumber || 1).padStart(3, '0')}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium block">Class & Section</span>
              <p className="text-sm font-semibold text-slate-900">
                {student?.classId?.className} (Sec {student?.section})
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium block">Admission Date</span>
              <p className="text-sm font-semibold text-slate-900">
                {admissionDateFormatted}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium block">Candidate Login ID</span>
              <p className="text-xs font-mono font-medium text-slate-700">
                {student?.email}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium block">Parent Phone / WhatsApp</span>
              <p className="text-xs font-mono font-medium text-slate-700">
                {student?.parentPhone}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium block">Examination Center</span>
              <p className="text-xs font-semibold text-slate-900">
                EduManage Central Campus Hall A & B
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium block">Fee Clearance</span>
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                CLEARED FOR EXAM
              </span>
            </div>
          </div>

          {/* Exam Timetable Schedule Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Examination Schedule & Seating Allotment
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Day</th>
                    <th className="py-2.5 px-3">Time Slot</th>
                    <th className="py-2.5 px-3">Center Room</th>
                    <th className="py-2.5 px-3 text-right">Invigilator Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {examDatesheet.map((exam) => (
                    <tr key={exam.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {exam.subjectName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-semibold">
                        {exam.date}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {exam.day}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {exam.time}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {exam.room}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300 font-mono">
                        _______________
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions for Candidates */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 space-y-1.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Important Candidate Rules:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Candidates must report at least 30 minutes before the scheduled paper time.</li>
              <li>This slip must be placed on the top-right corner of the candidate&apos;s desk throughout the examination.</li>
              <li>Electronic devices, programmable calculators, or unfair means will result in immediate disqualification.</li>
            </ol>
          </div>

          {/* Signature Footer */}
          <div className="pt-8 flex items-end justify-between text-xs">
            <div className="text-center">
              <div className="w-40 border-b border-slate-400 mb-1" />
              <span className="text-[11px] text-slate-500 font-medium">Candidate Signature</span>
            </div>

            <div className="text-center">
              <div className="w-40 border-b border-slate-900 mb-1" />
              <span className="text-[11px] font-bold text-slate-900 uppercase">
                Controller of Examinations
              </span>
              <span className="block text-[10px] text-slate-500">EduManage Academy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
