import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-500/30 animate-pulse">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-2">Access Denied</h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          You do not have the required permissions or role to view this page. If you believe this is an error, please reach out to the academy administration.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
          >
            <ArrowLeft className="w-4 h-4" />
            Switch Account or Sign In
          </Link>

          <Link
            href="/"
            className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition duration-200 flex items-center justify-center gap-2 border border-slate-600/50"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
