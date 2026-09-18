import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import connectToDatabase from './mongodb';
import TeacherClass from '../models/TeacherClass';

/**
 * Helper to fetch session in server components or API route handlers
 */
export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Verify session is valid and has role
 */
export async function getAuthenticatedUser() {
  const session = await getServerAuthSession();
  if (!session || !session.user) {
    return null;
  }
  return session.user;
}

/**
 * Verify user is Super Admin
 */
export async function verifyAdmin() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'admin') {
    return false;
  }
  return user;
}

/**
 * Verify user is Teacher
 */
export async function verifyTeacher() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'teacher') {
    return false;
  }
  return user;
}

/**
 * Verify user is Student
 */
export async function verifyStudent() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'student') {
    return false;
  }
  return user;
}

/**
 * Verify a teacher actually owns/teaches the specified class and subject
 */
export async function checkTeacherOwnsClass(teacherId, classId, subjectId) {
  if (!teacherId || !classId) {
    return false;
  }

  await connectToDatabase();
  const query = {
    teacherId: teacherId.toString(),
    classId: classId.toString(),
  };

  if (subjectId) {
    query.subjectId = subjectId.toString();
  }

  const assignment = await TeacherClass.findOne(query);
  return Boolean(assignment);
}

/**
 * Verify a student only accesses their own student data
 */
export function checkStudentOwnsData(sessionStudentId, requestedStudentId) {
  if (!sessionStudentId || !requestedStudentId) {
    return false;
  }
  return sessionStudentId.toString() === requestedStudentId.toString();
}
