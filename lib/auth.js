import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectToDatabase from './mongodb';
import User from '../models/User';
import Student from '../models/Student';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        await connectToDatabase();
        const email = credentials.email.toLowerCase().trim();

        // 1. Check User collection (Admin or Teacher)
        const user = await User.findOne({ email });

        if (user) {
          // Check if teacher is pending approval
          if (user.role === 'teacher' && user.status === 'pending') {
            throw new Error('PENDING_APPROVAL: Your teacher registration is waiting for admin approval. Please contact the administration.');
          }

          const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordMatch) {
            throw new Error('Invalid email or password');
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            phone: user.phone || '',
          };
        }

        // 2. Check Student collection
        const student = await Student.findOne({ email });

        if (student) {
          const isPasswordMatch = await bcrypt.compare(credentials.password, student.password);
          if (!isPasswordMatch) {
            throw new Error('Invalid email or password');
          }

          return {
            id: student._id.toString(),
            name: student.name,
            email: student.email,
            role: 'student',
            status: 'active',
            classId: student.classId ? student.classId.toString() : null,
            section: student.section,
            rollNumber: student.rollNumber,
            mustChangePassword: student.mustChangePassword ?? true,
          };
        }

        // Neither user nor student found
        throw new Error('Invalid email or password');
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.mustChangePassword = user.mustChangePassword;
        token.classId = user.classId;
        token.section = user.section;
        token.rollNumber = user.rollNumber;
      }

      // Allow client session updates (e.g., when student updates mustChangePassword)
      if (trigger === 'update' && session?.mustChangePassword !== undefined) {
        token.mustChangePassword = session.mustChangePassword;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.mustChangePassword = token.mustChangePassword;
        session.user.classId = token.classId;
        session.user.section = token.section;
        session.user.rollNumber = token.rollNumber;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'edumanage-ai-super-secure-jwt-secret-key-2026-pakistan',
};
