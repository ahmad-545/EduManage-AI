'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  GraduationCap,
  User,
  Layers,
  Hash,
  Phone,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function AddStudentPage() {
  const router = useRouter();
  const [existingClasses, setExistingClasses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    className: '',
    section: 'A',
    rollNumber: '',
    parentPhone: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdStudent, setCreatedStudent] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    fetchExistingClasses();
  }, []);

  const fetchExistingClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      setExistingClasses(data.classes || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  // Helper to quickly generate a random password in the input field
  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 5; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `Std${rand}!`;
    setFormData((prev) => ({ ...prev, password: generated }));
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to admit student');
        setLoading(false);
        return;
      }

      setCreatedStudent(data);
      setLoading(false);
    } catch (err) {
      setErrorMsg('An unexpected network error occurred: ' + err.message);
      setLoading(false);
    }
  };

  const copyText = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'pass') {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    } else if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else if (type === 'all') {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const plainPassword = createdStudent?.credentials?.password || '';
  const loginId = createdStudent?.student?.email || '';
  const parentPhone = createdStudent?.student?.parentPhone || '';
  const studentName = createdStudent?.student?.name || '';

  const allCredentialsText = `Assalamu Alaikum,\n\nStudent Portal Login Credentials for ${studentName}:\n- Login ID / Email: ${loginId}\n- Password: ${plainPassword}\n- Parent WhatsApp: ${parentPhone}\n- Portal: ${typeof window !== 'undefined' ? window.location.origin : ''}/login\n\nPlease change your temporary password upon first sign in.`;

  // WhatsApp web share URL
  const cleanPhoneForWhatsApp = parentPhone.replace(/[^\d+]/g, '');
  const whatsappShareUrl = `https://wa.me/${cleanPhoneForWhatsApp.replace('+', '')}?text=${encodeURIComponent(allCredentialsText)}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/students"
          className="text-slate-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Students Directory
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Admit New Student
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Directly enter the student details, Class, Section, and Roll Number. The class is auto-resolved or created instantly.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Modal / Credentials Showcase Card */}
      {createdStudent ? (
        <div className="bg-white border border-emerald-300 rounded-2xl p-6 shadow-md space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Admitted Successfully!</h2>
              <p className="text-xs text-emerald-700 font-medium">
                Credentials saved and dispatched to parent&apos;s WhatsApp.
              </p>
            </div>
          </div>

          {/* Credentials Box displayed locally for Super Admin */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-sans">Student Name:</span>
              <span className="font-bold text-slate-900 font-sans text-sm">{studentName}</span>
            </div>

            {/* Login Email */}
            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-sans">Portal Login ID:</span>
              <div className="flex items-center gap-2">
                <span className="text-sky-700 font-bold select-all">{loginId}</span>
                <button
                  type="button"
                  onClick={() => copyText(loginId, 'email')}
                  className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 shadow-xs"
                  title="Copy Login Email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Password (Visible locally to Super Admin) */}
            <div className="flex items-center justify-between py-2 border-b border-slate-200 bg-sky-50/70 -mx-2 px-2 rounded-lg">
              <span className="text-sky-900 font-sans font-bold flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-sky-600" /> Student Password:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-bold text-sm bg-white px-2.5 py-0.5 rounded border border-emerald-300 select-all shadow-xs">
                  {plainPassword}
                </span>
                <button
                  type="button"
                  onClick={() => copyText(plainPassword, 'pass')}
                  className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white font-sans text-[11px] font-semibold flex items-center gap-1 shadow-xs transition"
                  title="Copy Password"
                >
                  {copiedPass ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-sans">Roll Number & Section:</span>
              <span className="text-slate-800 font-medium">
                #{String(createdStudent.student.rollNumber).padStart(3, '0')} (Section {createdStudent.student.section})
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-sans">Parent WhatsApp:</span>
              <span className="text-slate-800 font-bold">{parentPhone}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={() => copyText(allCredentialsText, 'all')}
              className="w-full sm:flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 flex items-center justify-center gap-2 transition"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copiedAll ? 'Copied Full Details!' : 'Copy All Credentials'}</span>
            </button>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Open in WhatsApp</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              <strong>Admin Record:</strong> You can see and copy this student&apos;s password above. The student will be prompted to change their password upon their first login.
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setCreatedStudent(null);
                setFormData({
                  name: '',
                  className: '',
                  section: 'A',
                  rollNumber: '',
                  parentPhone: '',
                  password: '',
                });
              }}
              className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition text-center"
            >
              Admit Another Student
            </button>

            <Link
              href="/admin/students"
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition text-center"
            >
              View Students List
            </Link>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Manual Class Name & Section inputs with suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Class Name (Type directly, e.g. Class 10, Matric, 9th)
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    list="classes-datalist"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    placeholder="e.g. Class 10 or 9th"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                  <datalist id="classes-datalist">
                    {Array.from(new Set(existingClasses.map((c) => c.className))).map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Type any class name. If new, it will be created automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Section (Type directly, e.g. A, B, Morning)
                </label>
                <input
                  type="text"
                  required
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                  placeholder="e.g. A"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Default is Section A.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Class Roll Number
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Parent WhatsApp / Mobile Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Custom or Auto-Generated Password Field */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  Student Portal Password (Write your own or Auto-Generate)
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition"
                >
                  <KeyRound className="w-3 h-3" />
                  Auto-Generate
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Type a custom password or leave blank to auto-generate"
                  className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                You can write any password here (e.g. <code className="text-sky-700 font-semibold font-mono">Student123!</code>). If left blank, a random password will be auto-generated.
              </p>
            </div>

            {/* Email preview format helper */}
            <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Login ID Format:</span>{' '}
              Student portal login email will be auto-formatted as{' '}
              <span className="font-mono text-sky-700 font-semibold">
                {formData.className && formData.rollNumber
                  ? `${formData.className.replace(/\s+/g, '').toLowerCase()}${formData.section.toLowerCase()}-${String(formData.rollNumber).padStart(3, '0')}@${process.env.NEXT_PUBLIC_SCHOOL_DOMAIN || 'edumanage.pk'}`
                  : '10a-001@edumanage.pk'}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  Admit Student & Dispatch Credentials
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
