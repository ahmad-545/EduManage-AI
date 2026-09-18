'use client';

import { useSession } from 'next-auth/react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import ChangePasswordModal from '../../components/shared/ChangePasswordModal';

export default function StudentLayout({ children }) {
  const { data: session } = useSession();
  const mustChangePassword = session?.user?.mustChangePassword;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar role="student" />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mandatory password change popup on first login */}
      <ChangePasswordModal
        isOpen={Boolean(mustChangePassword)}
        onClose={() => {}}
      />
    </div>
  );
}
