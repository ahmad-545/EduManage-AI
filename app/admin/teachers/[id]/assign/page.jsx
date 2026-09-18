'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Layers,
  BookOpen,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function TeacherAssignPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id;

  const [teacher, setTeacher] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [existingClasses, setExistingClasses] = useState([]);

  // Direct manual inputs
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('A');
  const [subjectName, setSubjectName] = useState('');

  // Weekly Schedule Slots for new assignment
  const [scheduleSlots, setScheduleSlots] = useState([
    { day: 'Monday', timeSlot: '09:00 AM - 10:00 AM', room: 'Room 101' },
  ]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    if (teacherId) {
      loadData();
    }
  }, [teacherId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignRes, classRes] = await Promise.all([
        fetch(`/api/admin/teachers/${teacherId}/assign`),
        fetch('/api/admin/classes'),
      ]);

      const assignData = await assignRes.json();
      const classData = await classRes.json();

      setTeacher(assignData.teacher);
      setAssignments(assignData.assignments || []);
      setExistingClasses(classData.classes || []);
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addScheduleSlot = () => {
    setScheduleSlots([...scheduleSlots, { day: 'Monday', timeSlot: '10:00 AM - 11:00 AM', room: 'Room 101' }]);
  };

  const removeScheduleSlot = (index) => {
    setScheduleSlots(scheduleSlots.filter((_, i) => i !== index));
  };

  const updateScheduleSlot = (index, field, value) => {
    const updated = [...scheduleSlots];
    updated[index][field] = value;
    setScheduleSlots(updated);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!className.trim() || !subjectName.trim()) {
      setFeedback({ type: 'error', text: 'Please enter both Class Name and Subject Name.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ type: '', text: '' });

      const res = await fetch(`/api/admin/teachers/${teacherId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: className.trim(),
          section: (section || 'A').trim().toUpperCase(),
          subjectName: subjectName.trim(),
          scheduleSlots,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to assign teacher.' });
      } else {
        setFeedback({ type: 'success', text: 'Teacher assigned successfully with weekly schedule!' });
        setSubjectName('');
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network error: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('Are you sure you want to remove this class assignment and its schedule?')) return;

    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}/assign?assignmentId=${assignmentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: 'Assignment removed.' });
        loadData();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to remove assignment' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs">
        <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
        Loading educator details and schedule...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/admin/teachers"
            className="text-slate-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Teachers
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Assign Classes & Timetable
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Assign <span className="text-sky-700 font-bold">{teacher?.name}</span> ({teacher?.email}) to class cohorts, subjects, and weekly timetable slots.
        </p>
      </div>

      {feedback.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: New Assignment Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-600" />
              New Class & Subject Assignment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Type the Class, Section, and Subject directly. System auto-creates if new.
            </p>
          </div>

          <form onSubmit={handleAssignSubmit} className="space-y-4">
            {/* Manual Class Name & Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Class Name (Type directly)
                </label>
                <input
                  type="text"
                  required
                  list="teacher-classes-datalist"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Class 10 or 9th"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
                <datalist id="teacher-classes-datalist">
                  {Array.from(new Set(existingClasses.map((c) => c.className))).map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Section (Type directly)
                </label>
                <input
                  type="text"
                  required
                  value={section}
                  onChange={(e) => setSection(e.target.value.toUpperCase())}
                  placeholder="e.g. A"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Manual Subject Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject Name (Type directly)
              </label>
              <input
                type="text"
                required
                list="subjects-datalist"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Mathematics, Physics, Chemistry"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
              <datalist id="subjects-datalist">
                <option value="Mathematics" />
                <option value="Physics" />
                <option value="Chemistry" />
                <option value="Biology" />
                <option value="Computer Science" />
                <option value="English" />
                <option value="Urdu" />
                <option value="Islamiat" />
                <option value="Pakistan Studies" />
              </datalist>
              <p className="text-[11px] text-slate-500 mt-1">
                You can assign multiple subjects/lectures to this teacher for the same class!
              </p>
            </div>

            {/* Weekly Timetable Slots */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-600" /> Weekly Class Schedule Slots
                </label>
                <button
                  type="button"
                  onClick={addScheduleSlot}
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Slot
                </button>
              </div>

              <div className="space-y-2">
                {scheduleSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={slot.day}
                      onChange={(e) => updateScheduleSlot(index, 'day', e.target.value)}
                      className="w-1/3 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                        (day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        )
                      )}
                    </select>

                    <input
                      type="text"
                      value={slot.timeSlot}
                      onChange={(e) => updateScheduleSlot(index, 'timeSlot', e.target.value)}
                      placeholder="09:00 AM - 10:00 AM"
                      className="w-1/3 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 font-mono"
                    />

                    <input
                      type="text"
                      value={slot.room || ''}
                      onChange={(e) => updateScheduleSlot(index, 'room', e.target.value)}
                      placeholder="Room 101"
                      className="w-1/3 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400"
                    />

                    {scheduleSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeScheduleSlot(index)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Save Assignment & Timetable
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Existing Assignments List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Current Assignments ({assignments.length})
            </h2>
          </div>

          {assignments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No classes or subjects currently assigned to this educator.
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 hover:border-sky-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {item.classId?.className} - Section {item.classId?.section}
                      </h4>
                      <p className="text-[11px] text-sky-700 font-semibold">
                        Subject: {item.subjectId?.subjectName}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteAssignment(item._id)}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 transition shadow-xs"
                      title="Remove Assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.schedule && item.schedule.length > 0 ? (
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">
                        Weekly Timetable:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.schedule.map((slot) => (
                          <span
                            key={slot._id}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700 font-mono"
                          >
                            {slot.day}: {slot.timeSlot}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">No timetable slots set.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
