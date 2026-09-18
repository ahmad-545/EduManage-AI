'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ClassWiseStudentList from '../../../components/shared/ClassWiseStudentList';
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Clock,
  Award,
  Users,
  Calendar,
} from 'lucide-react';

export default function TeacherMyClassesPage() {
  const [data, setData] = useState({ classes: [], students: [], assignedSubjects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/my-classes');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load assigned classes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group assigned subjects / lectures by classId
  const groupedClasses = (data.classes || []).map((cls) => {
    const cId = cls._id.toString();
    const lectures = (data.assignedSubjects || []).filter(
      (sub) => sub.classId.toString() === cId
    );
    const studentsInClass = (data.students || []).filter(
      (s) => (s.classId?._id ? s.classId._id.toString() : s.classId?.toString()) === cId
    );
    return {
      classInfo: cls,
      lectures,
      studentsCount: studentsInClass.length,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Classes & Lectures
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Class-wise lecture schedule with direct one-click Attendance, Marks, and Quiz management.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          Loading assigned classes and lectures...
        </div>
      ) : data.classes?.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
          <p className="font-bold text-slate-800 text-sm">No Classes Assigned Yet</p>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">
            Your teacher account is active. The Super Admin has not yet assigned any classes or lectures to your timetable.
          </p>
        </div>
      ) : (
        <>
          {/* Class-Wise Cohorts Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-600" />
              Assigned Classes & Multi-Lecture Schedule
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {groupedClasses.map(({ classInfo, lectures, studentsCount }) => (
                <div
                  key={classInfo._id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Class Card Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {classInfo.className}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">
                          Section {classInfo.section}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-sky-600" />
                        {studentsCount} Students
                      </span>
                    </div>

                    {/* Lectures List inside this Class */}
                    <div className="mt-3 space-y-3">
                      {lectures.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No specific subjects assigned.</p>
                      ) : (
                        lectures.map((lec, idx) => (
                          <div
                            key={lec.subjectId}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                                  Lecture {idx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900">
                                  {lec.subjectName}
                                </h4>
                              </div>

                              {/* Timetable badges */}
                              {lec.schedule && lec.schedule.length > 0 ? (
                                <div className="text-right">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    <Clock className="w-3 h-3 text-sky-600" />
                                    {lec.schedule[0].day}: {lec.schedule[0].timeSlot}
                                  </span>
                                  {lec.schedule.length > 1 && (
                                    <span className="block text-[10px] text-slate-400 mt-0.5">
                                      +{lec.schedule.length - 1} more slots
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Timetable not set</span>
                              )}
                            </div>

                            {/* Direct Actions for this specific lecture */}
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                              <Link
                                href={`/teacher/attendance/${lec.classId}/${lec.subjectId}`}
                                className="flex-1 py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                              >
                                <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Mark Attendance
                              </Link>

                              <Link
                                href={`/teacher/marks/${lec.classId}/${lec.subjectId}`}
                                className="flex-1 py-1.5 px-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                              >
                                <ClipboardList className="w-3.5 h-3.5 text-sky-600" />
                                Enter Marks
                              </Link>

                              <Link
                                href={`/teacher/quizzes`}
                                className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                                title="Quizzes"
                              >
                                <Award className="w-3.5 h-3.5 text-slate-500" />
                                Quizzes
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Student Rosters Section */}
          <div className="pt-4 border-t border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              Class-Wise Enrolled Students Directory
            </h2>
            <ClassWiseStudentList
              classes={data.classes || []}
              students={data.students || []}
              role="teacher"
              assignedSubjects={data.assignedSubjects || []}
              onRefresh={fetchMyClasses}
            />
          </div>
        </>
      )}
    </div>
  );
}
