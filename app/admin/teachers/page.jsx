'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Clock,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  ArrowRight,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function TeachersDirectoryPage() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/teachers');
      const data = await res.json();
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error('Failed to load teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Teachers & Faculty Directory
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage teacher profiles, assign classes and subjects directly, and set up weekly timetables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/teachers/pending"
            className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-semibold flex items-center gap-2 transition shadow-xs"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            Pending Approvals ({teachers.filter((t) => t.status === 'pending').length})
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search educator by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono hidden md:inline">
          Showing {filteredTeachers.length} of {teachers.length} teachers
        </span>
      </div>

      {/* Teachers Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          Loading educators directory...
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-60 text-slate-400" />
          No teachers found matching search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher) => {
            const isPending = teacher.status === 'pending';

            return (
              <div
                key={teacher._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-sky-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{teacher.name}</h3>
                        <p className="text-[11px] text-slate-500 font-mono">{teacher.email}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isPending ? 'Pending' : 'Active'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 my-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-800">{teacher.phone || 'No phone recorded'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{teacher.assignments?.length || 0} Assigned Class-Lecture(s)</span>
                    </div>
                  </div>

                  {/* Badges for assignments */}
                  {teacher.assignments && teacher.assignments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {teacher.assignments.map((a) => (
                        <span
                          key={a._id}
                          className="px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-[10px] font-semibold text-sky-800"
                        >
                          {a.classId?.className}-{a.classId?.section}: {a.subjectId?.subjectName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200">
                  {isPending ? (
                    <Link
                      href="/admin/teachers/pending"
                      className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-amber-200"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Approve in Pending Queue
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/teachers/${teacher._id}/assign`}
                      className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold rounded-xl text-xs border border-sky-200 transition flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      Assign Classes & Timetable
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
