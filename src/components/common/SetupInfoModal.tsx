import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Database, Check, Copy, Key, ShieldCheck, UserCheck, Terminal } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

interface SetupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupInfoModal: React.FC<SetupInfoModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyEnv = () => {
    const envContent = `VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-public-key-here`;
    navigator.clipboard.writeText(envContent);
    setCopied(true);
    showToast({
      type: 'success',
      title: 'Tersalin',
      message: 'Format .env berhasil disalin ke clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Informasi Konfigurasi & Akun Demo"
      description="Panduan pengujian dan konektivitas database Supabase PostgreSQL"
      maxWidth="xl"
    >
      <div className="space-y-6 text-sm text-slate-700">
        {/* Status Connection Card */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            isSupabaseConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isSupabaseConfigured
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">
                Status Database:{' '}
                {isSupabaseConfigured ? 'Terhubung ke Supabase' : 'Mode Offline / Local Storage'}
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                {isSupabaseConfigured
                  ? 'Data tersimpan secara permanen di cloud database Supabase PostgreSQL.'
                  : 'Aplikasi berjalan menggunakan persistent storage lokal untuk demonstrasi instan.'}
              </p>
            </div>
          </div>
        </div>

        {/* Demo Accounts */}
        <div>
          <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-primary-900" />
            Akun Demo Siap Pakai
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Admin */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 text-primary-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Role Admin
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Full Access
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <strong>Username:</strong> <code className="bg-slate-200 px-1.5 py-0.5 rounded">admin</code>
              </p>
              <p className="text-xs text-slate-600">
                <strong>Password:</strong> <code className="bg-slate-200 px-1.5 py-0.5 rounded">admin123</code>
              </p>
              <p className="text-[11px] text-slate-500">
                Akses: Tambah/Edit/Hapus barang, Manajemen Staff, Dashboard penuh.
              </p>
            </div>

            {/* Staff */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 text-primary-900">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Role Staff
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Laboran
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <strong>Username:</strong> <code className="bg-slate-200 px-1.5 py-0.5 rounded">staff</code>
              </p>
              <p className="text-xs text-slate-600">
                <strong>Password:</strong> <code className="bg-slate-200 px-1.5 py-0.5 rounded">staff123</code>
              </p>
              <p className="text-[11px] text-slate-500">
                Akses: Catat peminjaman, proses pengembalian, cek stok barang.
              </p>
            </div>
          </div>
        </div>

        {/* Steps to deploy or link Supabase */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-secondary" />
            Langkah Cepat Konfigurasi Supabase
          </h5>
          <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
            <li>Buka dashboard project di <strong>https://supabase.com</strong>.</li>
            <li>Buka menu <strong>SQL Editor</strong> &gt; Klik <strong>New Query</strong>.</li>
            <li>
              Jalankan seluruh isi file <code className="bg-slate-200 px-1 rounded">supabase/full_setup.sql</code> untuk membuat tabel, RLS, dan RPC otomatis.
            </li>
            <li>
              Buka <strong>Project Settings &gt; API</strong>, lalu salin <strong>URL</strong> dan <strong>anon key</strong> ke file <code className="bg-slate-200 px-1 rounded">.env</code>.
            </li>
          </ol>
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleCopyEnv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Salin Format .env</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

