import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Only protect admin, teacher, and student route paths
  const isAdminPath = pathname.startsWith('/admin');
  const isTeacherPath = pathname.startsWith('/teacher');
  const isStudentPath = pathname.startsWith('/student');

  if (!isAdminPath && !isTeacherPath && !isStudentPath) {
    return NextResponse.next();
  }

  // Get JWT token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'edumanage-ai-super-secure-jwt-secret-key-2026-pakistan',
  });

  // If not logged in, redirect to login page with callbackUrl
  if (!token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  const role = token.role;

  // Admin route check
  if (isAdminPath && role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // Teacher route check
  if (isTeacherPath && role !== 'teacher') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // Student route check
  if (isStudentPath && role !== 'student') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
};
