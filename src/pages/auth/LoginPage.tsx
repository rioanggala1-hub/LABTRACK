import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, FlaskConical, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
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
      // The ProtectedRoute or redirect logic will route based on user role
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
    const creds = roleType === 'admin'
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
        title: 'Login Cepat Berhasil',
        message: `Masuk sebagai ${roleType.toUpperCase()}.`,
      });
      navigate(roleType === 'admin' ? '/admin/dashboard' : '/staff/dashboard');
    } catch (err: any) {
      setError(err.message || 'Gagal login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-primary-50 to-blue-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Header Branding */}
        <div className="bg-primary-950 p-8 text-center text-white relative">
          <div className="w-14 h-14 bg-gradient-to-tr from-secondary to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">LabTrack</h1>
          <p className="text-xs text-primary-200 mt-1 max-w-xs mx-auto">
            Laboratory Inventory & Borrowing Management System
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Masuk ke Sistem</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan akun Administrator atau Staff Laboran Anda
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <span className="font-bold">&bull;</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username atau Email
              </label>
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
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Shortcut */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Tombol Akses Cepat Demo (Penguji / Dosen)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Demo Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold transition"
              >
                <UserCheck className="w-4 h-4 text-secondary" />
                <span>Demo Staff</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

