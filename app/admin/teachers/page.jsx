'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  Phone,
  BookOpen,
  Calendar,
  ArrowRight,
  Search,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

export default function TeachersDirectoryPage() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Teacher Modal State
  const [editTeacher, setEditTeacher] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    password: '',
    baseSalary: 50000,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Teacher Modal State
  const [deleteTeacher, setDeleteTeacher] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Notification Toast
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

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

  const openEditModal = (teacher) => {
    setEditTeacher(teacher);
    setEditForm({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      status: teacher.status || 'active',
      password: '',
      baseSalary: teacher.baseSalary || 50000,
    });
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTeacher) return;
    setEditLoading(true);
    setEditError('');

    try {
      const res = await fetch(`/api/admin/teachers/${editTeacher._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || 'Failed to update teacher');
        setEditLoading(false);
        return;
      }

      showToast(`Teacher "${editForm.name}" updated successfully!`);
      setEditTeacher(null);
      fetchTeachers();
    } catch (err) {
      setEditError('An unexpected network error occurred');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTeacher) return;
    setDeleteLoading(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/admin/teachers/${deleteTeacher._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete teacher');
        setDeleteLoading(false);
        return;
      }

      showToast(`Teacher "${deleteTeacher.name}" deleted successfully!`);
      setDeleteTeacher(null);
      fetchTeachers();
    } catch (err) {
      setDeleteError('An unexpected network error occurred');
    } finally {
      setDeleteLoading(false);
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
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Teachers & Faculty Directory
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage teacher profiles, assign classes and subjects directly, update credentials, or record daily attendance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/teachers/attendance"
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs"
          >
            <ClipboardCheck className="w-4 h-4" />
            Teacher Attendance
          </Link>

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
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-sky-300 transition relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <Link href={`/admin/teachers/${teacher._id}`} className="hover:text-sky-600 transition">
                          <h3 className="text-sm font-bold text-slate-900 hover:text-sky-600 flex items-center gap-1.5">
                            {teacher.name}
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </h3>
                        </Link>
                        <p className="text-[11px] text-slate-500 font-mono">{teacher.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isPending
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isPending ? 'Pending' : 'Active'}
                      </span>

                      {/* Edit button */}
                      <button
                        type="button"
                        onClick={() => openEditModal(teacher)}
                        title="Edit Teacher"
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setDeleteTeacher(teacher)}
                        title="Delete Teacher"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 my-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-slate-800">{teacher.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="font-mono font-bold text-slate-900">
                          PKR {(teacher.baseSalary || 50000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{teacher.assignments?.length || 0} Assigned Cohorts & Timetable</span>
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

                <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                  <Link
                    href={`/admin/teachers/${teacher._id}`}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    Full Profile
                  </Link>

                  {isPending ? (
                    <Link
                      href="/admin/teachers/pending"
                      className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-amber-200"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Approve
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/teachers/${teacher._id}/assign`}
                      className="flex-1 py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold rounded-xl text-xs border border-sky-200 transition flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      Timetable
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setEditTeacher(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Educator Profile</h3>
                <p className="text-xs text-slate-500">Modify faculty account details & status</p>
              </div>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name & Title
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone / WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                >
                  <option value="active">Active (Can log in)</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Monthly Base Salary (PKR)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    value={editForm.baseSalary}
                    onChange={(e) => setEditForm({ ...editForm, baseSalary: Number(e.target.value) })}
                    placeholder="50000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reset Password (Optional)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Leave blank to keep unchanged"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditTeacher(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-60"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              Delete Teacher Record?
            </h3>
            <p className="text-xs text-slate-500 text-center mb-5">
              Are you sure you want to delete <span className="font-bold text-slate-900">{deleteTeacher.name}</span> ({deleteTeacher.email})?
              All assigned class subjects, timetable schedule slots, and teacher attendance logs will also be permanently removed.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTeacher(null)}
                className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteConfirm}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
