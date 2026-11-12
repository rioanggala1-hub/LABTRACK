import React from 'react';
import { Menu, Shield, User, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  title?: string;
  onOpenHelp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  title = 'Sistem Manajemen Inventaris & Peminjaman Lab',
  onOpenHelp,
}) => {
  const { user, role, isSupabaseActive } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 hidden sm:block">
            Laboratorium Komputer &bull; Coding Talent Challenge
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Supabase status badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium bg-slate-50 border-slate-200">
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-slate-600">
            {isSupabaseActive ? 'Supabase Connected' : 'Demo DB Mode'}
          </span>
        </div>

        {/* Setup / Instructions guide button */}
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary-900 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition"
            title="Panduan Supabase & Demo"
          >
            <HelpCircle className="w-4 h-4 text-primary-700" />
            <span className="hidden sm:inline">Info Setup</span>
          </button>
        )}

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-primary-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {role === 'admin' ? (
              <Shield className="w-4 h-4 text-amber-300" />
            ) : (
              <User className="w-4 h-4 text-blue-200" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800">{user?.full_name}</p>
            <p className="text-[11px] text-slate-500 capitalize">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

