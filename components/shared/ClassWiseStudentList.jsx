'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  GraduationCap,
  Mail,
  Phone,
  Edit2,
  Trash2,
  CalendarCheck,
  ClipboardList,
  Plus,
  ArrowUpDown,
  BookOpen,
  User,
} from 'lucide-react';

export default function ClassWiseStudentList({
  classes = [],
  students = [],
  role = 'admin',
  onDeleteStudent = null,
  assignedSubjects = [], // For teachers: array of { classId, subjectId, subjectName }
}) {
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rollNumber'); // 'rollNumber' | 'name'
  const [sortOrder, setSortOrder] = useState('asc');

  // Filter students based on class selection and search query
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const studentClassId = s.classId?._id ? s.classId._id.toString() : s.classId?.toString();
      const matchesClass = selectedClassId === 'all' || studentClassId === selectedClassId;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.rollNumber?.toString().includes(q) ||
        s.parentPhone?.toLowerCase().includes(q);

      return matchesClass && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'rollNumber') {
        return sortOrder === 'asc' ? a.rollNumber - b.rollNumber : b.rollNumber - a.rollNumber;
      } else {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });
  }, [students, selectedClassId, searchQuery, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search, Filter, and Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-xs">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedClassId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedClassId === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Classes ({students.length})
          </button>

          {classes.map((c) => {
            const count = students.filter(
              (s) => (s.classId?._id ? s.classId._id.toString() : s.classId?.toString()) === c._id.toString()
            ).length;

            return (
              <button
                key={c._id}
                onClick={() => setSelectedClassId(c._id.toString())}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedClassId === c._id.toString()
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.className} - {c.section} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, roll #, email..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {role === 'admin' && (
            <Link
              href="/admin/students/add"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-xs transition whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Admit Student</span>
            </Link>
          )}
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => toggleSort('rollNumber')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Roll #</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Portal Login ID</th>
                <th className="py-3 px-4">Parent WhatsApp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                    <p className="font-medium">No students found matching current filters.</p>
                    {role === 'admin' && (
                      <Link
                        href="/admin/students/add"
                        className="inline-block mt-2 text-sky-600 hover:text-sky-700 font-semibold"
                      >
                        + Admit a new student
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const classData = s.classId || {};
                  const classNameFormatted = classData.className
                    ? `${classData.className} - Sec ${classData.section || s.section}`
                    : `Sec ${s.section}`;

                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-sky-50/40 transition duration-150"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                        #{String(s.rollNumber).padStart(3, '0')}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">
                            {s.name.charAt(0)}
                          </div>
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[11px]">
                          {classNameFormatted}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          {s.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 text-[11px]">
                        <span className="flex items-center gap-1 font-mono text-emerald-700 font-medium">
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          {s.parentPhone || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {role === 'admin' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/students/${s._id}/edit`}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 transition"
                              title="Edit Student Profile (Admin Only)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>

                            {onDeleteStudent && (
                              <button
                                onClick={() => onDeleteStudent(s._id, s.name)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition"
                                title="Delete Student Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          // Teacher role view: links to mark attendance / marks
                          <div className="flex items-center justify-end gap-1.5">
                            {assignedSubjects.length > 0 ? (
                              assignedSubjects
                                .filter((sub) => {
                                  const cId = s.classId?._id || s.classId;
                                  return sub.classId.toString() === cId?.toString();
                                })
                                .slice(0, 1)
                                .map((sub) => (
                                  <div key={sub.subjectId} className="flex gap-1.5">
                                    <Link
                                      href={`/teacher/attendance/${sub.classId}/${sub.subjectId}`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-[11px] transition"
                                    >
                                      <CalendarCheck className="w-3 h-3 text-emerald-600" />
                                      <span>Attendance</span>
                                    </Link>
                                    <Link
                                      href={`/teacher/marks/${sub.classId}/${sub.subjectId}`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-semibold text-[11px] transition"
                                    >
                                      <ClipboardList className="w-3 h-3 text-sky-600" />
                                      <span>Marks</span>
                                    </Link>
                                  </div>
                                ))
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Enrolled</span>
                            )}
                          </div>
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
