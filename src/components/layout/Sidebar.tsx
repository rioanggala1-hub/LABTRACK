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
    { to: '/admin/dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
    { to: '/inventory', label: 'Inventaris Barang', icon: Boxes },
    { to: '/borrowing', label: 'Peminjaman', icon: ArrowUpRight },
    { to: '/returning', label: 'Pengembalian', icon: ArrowDownLeft },
    { to: '/history', label: 'Riwayat Transaksi', icon: History },
    { to: '/users', label: 'Manajemen Staff', icon: Users },
  ];

  const staffNavItems = [
    { to: '/staff/dashboard', label: 'Dashboard Staff', icon: LayoutDashboard },
    { to: '/inventory', label: 'Daftar Barang', icon: Boxes },
    { to: '/borrowing', label: 'Peminjaman', icon: ArrowUpRight },
    { to: '/returning', label: 'Pengembalian', icon: ArrowDownLeft },
    { to: '/history', label: 'Riwayat Transaksi', icon: History },
  ];

  const navItems = role === 'admin' ? adminNavItems : staffNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-primary-950 text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-primary-900",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo & Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-primary-900/60 bg-primary-950">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide text-white">LabTrack</h1>
            <p className="text-[11px] text-primary-300 font-medium">Laboratory System</p>
          </div>
        </div>

        {/* User Role Badge Card */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-primary-900/50 border border-primary-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-800 flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" /> Admin Lab
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                    <UserCheck className="w-3 h-3" /> Staff Laboran
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-primary-400 mb-2">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-secondary text-white shadow-md shadow-secondary/30 font-semibold"
                      : "text-primary-200 hover:text-white hover:bg-primary-900/60"
                  )
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Database Status Indicator */}
        <div className="px-6 py-3 border-t border-primary-900/60 bg-primary-950/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-primary-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Database</span>
            </span>
            {isSupabaseActive ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Supabase
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Local / Demo
              </span>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-primary-900/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:text-white hover:bg-red-600/20 border border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
};

