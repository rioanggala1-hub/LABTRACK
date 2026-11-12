import React, { useState } from 'react';
import {
  Menu,
  Shield,
  User,
  HelpCircle,
  Bell,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
  onOpenHelp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  title = 'Dashboard Overview',
  subtitle = 'Sistem Manajemen Inventaris & Peminjaman Laboratorium Komputer',
  onOpenHelp,
}) => {
  const { user, role, isSupabaseActive } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Peminjaman Aktif',
      desc: '3 transaksi sedang berlangsung dan menunggu pengembalian.',
      time: '10m yang lalu',
      type: 'warning',
    },
    {
      id: 2,
      title: 'Stok Terkelola',
      desc: 'Database Supabase tersinkronisasi secara otomatis.',
      time: '1 jam yang lalu',
      type: 'success',
    },
  ];

  return (
    <header className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 shadow-[0_2px_12px_rgba(20,45,78,0.03)]">
      {/* Left: Mobile Toggle & Page Info */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition active:scale-95"
          aria-label="Buka Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">{title}</h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              <Sparkles className="w-2.5 h-2.5 text-blue-500" />
              SaaS Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Search Mock/Quick Input */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl text-xs text-slate-400 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari fitur, barang, staf..."
            className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder:text-slate-400"
          />
          <kbd className="hidden md:inline-block text-[10px] bg-slate-200/70 text-slate-500 px-1.5 py-0.5 rounded font-mono">
            /
          </kbd>
        </div>

        {/* Database Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold bg-slate-50/80 border-slate-200 shadow-sm">
          <span
            className={`w-2 h-2 rounded-full ${isSupabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
          />
          <span className="text-slate-600 text-[11px]">
            {isSupabaseActive ? 'Supabase Live' : 'Demo LocalDB'}
          </span>
        </div>

        {/* Setup / Instructions button */}
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition active:scale-95 shadow-sm"
            title="Informasi Konfigurasi & Database"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Panduan</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition active:scale-95"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-slide-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifikasi Sistem</h4>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">2 baru</span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-2 space-y-1">
                {notifications.map((n) => (
                  <div key={n.id} className="pt-2.5 pb-2 hover:bg-slate-50 p-2 rounded-xl transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {n.type === 'warning' ? (
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown Preview */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#142D4E] to-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-md ring-2 ring-blue-500/10">
              {role === 'admin' ? (
                <Shield className="w-4 h-4 text-amber-300" />
              ) : (
                <User className="w-4 h-4 text-cyan-200" />
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="hidden md:block text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-800 leading-none">{user?.full_name}</p>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
              {role === 'admin' ? 'Administrator' : 'Staff Laboran'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
