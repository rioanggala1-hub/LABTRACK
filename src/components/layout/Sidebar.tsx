import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Users,
  LogOut,
  FlaskConical,
  Database,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, logout, isSupabaseActive } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null },
    { to: '/inventory', label: 'Inventaris Barang', icon: Boxes, badge: 'Stok' },
    { to: '/borrowing', label: 'Peminjaman Alat', icon: ArrowUpRight, badge: null },
    { to: '/returning', label: 'Pengembalian', icon: ArrowDownLeft, badge: null },
    { to: '/history', label: 'Riwayat Transaksi', icon: History, badge: null },
    { to: '/users', label: 'Manajemen Staff', icon: Users, badge: 'Admin' },
  ];

  const staffNavItems = [
    { to: '/staff/dashboard', label: 'Dashboard Staff', icon: LayoutDashboard, badge: null },
    { to: '/inventory', label: 'Daftar Barang', icon: Boxes, badge: null },
    { to: '/borrowing', label: 'Peminjaman Alat', icon: ArrowUpRight, badge: null },
    { to: '/returning', label: 'Pengembalian', icon: ArrowDownLeft, badge: null },
    { to: '/history', label: 'Riwayat Transaksi', icon: History, badge: null },
  ];

  const navItems = role === 'admin' ? adminNavItems : staffNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#142D4E] text-slate-200 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800/80 shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 bg-[#0F233D]/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-2 ring-white/10">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">LabTrack</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Laboratory System
              </p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 mx-4 mt-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#142D4E]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    Administrator
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    Staff Laboran
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Navigasi
            </span>
            <Sparkles className="w-3 h-3 text-cyan-400/60" />
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="tracking-wide">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                            isActive
                              ? "bg-white/25 text-white"
                              : "bg-white/10 text-slate-400 group-hover:text-slate-200"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200",
                          isActive ? "opacity-100 text-white" : "opacity-0 group-hover:opacity-70 group-hover:translate-x-0.5"
                        )}
                      />
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Database Status Pill */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#0F233D]/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px] font-medium">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Konektivitas</span>
            </span>
            {isSupabaseActive ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Supabase
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Local Demo
              </span>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-300 hover:text-white hover:bg-red-500/20 border border-red-500/20 active:scale-[0.98] transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
};
