import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { SetupInfoModal } from '../common/SetupInfoModal';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path: string): string => {
    if (path.includes('/admin/dashboard')) return 'Dashboard Administrator';
    if (path.includes('/staff/dashboard')) return 'Dashboard Staff Laboran';
    if (path.includes('/inventory')) return 'Manajemen Inventaris Laboratorium';
    if (path.includes('/borrowing')) return 'Peminjaman Alat & Perangkat Lab';
    if (path.includes('/returning')) return 'Pengembalian Barang';
    if (path.includes('/history')) return 'Riwayat Transaksi Laboratorium';
    if (path.includes('/users')) return 'Manajemen Akun Staff';
    return 'Sistem Inventaris Lab';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle(location.pathname)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="py-5 px-8 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
          <p>
            &copy; 2026 <strong>Laboratory Inventory & Borrowing Management System (LabTrack)</strong>.
            Dibuat untuk Coding Talent Challenge.
          </p>
        </footer>
      </div>

      <SetupInfoModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

