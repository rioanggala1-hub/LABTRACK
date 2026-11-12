import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  FlaskConical,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Username atau email wajib diisi.');
      return;
    }
    if (!password) {
      setError('Password wajib diisi.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      showToast({
        type: 'success',
        title: 'Login Berhasil',
        message: 'Selamat datang di Laboratory Inventory System.',
      });
      if (identifier.toLowerCase().includes('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/staff/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa kembali username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleType: 'admin' | 'staff') => {
    const creds =
      roleType === 'admin'
        ? { user: 'admin', pass: 'admin123' }
        : { user: 'staff', pass: 'staff123' };

    setIdentifier(creds.user);
    setPassword(creds.pass);
    setError(null);
    setLoading(true);
    try {
      await login(creds.user, creds.pass);
      showToast({
        type: 'success',
        title: 'Login Demo Berhasil',
        message: `Berhasil masuk sebagai ${roleType.toUpperCase()}.`,
      });
      navigate(roleType === 'admin' ? '/admin/dashboard' : '/staff/dashboard');
    } catch (err: any) {
      setError(err.message || 'Gagal login demo.');
    } finally {
      setLoading(false);
    }
  };

  const fillFormOnly = (userVal: string, passVal: string) => {
    setIdentifier(userVal);
    setPassword(passVal);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-primary-50 to-blue-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-6">
        {/* Header Branding */}
        <div className="bg-primary-950 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-secondary/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-16 h-16 bg-gradient-to-tr from-secondary to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30 ring-4 ring-white/10">
            <FlaskConical className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">LabTrack</h1>
          <p className="text-xs text-primary-200 mt-1 max-w-xs mx-auto font-medium">
            Laboratory Inventory &amp; Borrowing Management System
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Masuk ke Sistem</h2>
              <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-primary-600" />
                Auth System
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan form di bawah atau pilih tombol login demo langsung
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <span className="font-bold">&bull;</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Username atau Email
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Isi cepat:</span>
                  <button
                    type="button"
                    onClick={() => fillFormOnly('admin', 'admin123')}
                    className="text-[10px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 transition"
                  >
                    admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillFormOnly('staff', 'staff123')}
                    className="text-[10px] font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 transition"
                  >
                    staff
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin atau staff"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-primary-900 hover:bg-primary-800 active:bg-primary-950 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-900/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span>Memproses Masuk...</span>
              ) : (
                <>
                  <span>Masuk Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Section: Tombol Akun Demo Khusus Pengujian & Dosen */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Akses Cepat 1-Klik: Akun Demo
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Klik salah satu tombol kartu di bawah untuk langsung masuk tanpa perlu mengetik kredensial:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card Demo Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                className="group text-left p-3.5 rounded-2xl border-2 border-amber-200 bg-amber-50/70 hover:bg-amber-100 hover:border-amber-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                      <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      Role Admin
                    </span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      Full Access
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    User: <strong className="font-mono text-slate-800">admin</strong> &bull; Pass: <strong className="font-mono text-slate-800">admin123</strong>
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-amber-900 group-hover:translate-x-0.5 transition-transform">
                  <span>Masuk Sebagai Admin</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                </div>
              </button>

              {/* Card Demo Staff */}
              <button
                type="button"
                onClick={() => handleQuickLogin('staff')}
                disabled={loading}
                className="group text-left p-3.5 rounded-2xl border-2 border-blue-200 bg-blue-50/70 hover:bg-blue-100 hover:border-blue-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
                      <UserCheck className="w-4 h-4 text-secondary flex-shrink-0" />
                      Role Staff
                    </span>
                    <span className="text-[10px] bg-blue-200/80 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                      Laboran
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    User: <strong className="font-mono text-slate-800">staff</strong> &bull; Pass: <strong className="font-mono text-slate-800">staff123</strong>
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-blue-900 group-hover:translate-x-0.5 transition-transform">
                  <span>Masuk Sebagai Staff</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
