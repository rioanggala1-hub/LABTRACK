import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { api } from '../../services/api';
import { Item, Borrowing } from '../../types';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';

export const StaffDashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsData, borrowData] = await Promise.all([
          api.getItems(),
          api.getBorrowings(),
        ]);
        setItems(itemsData);
        setBorrowings(borrowData);
      } catch (err) {
        console.error('Error fetching staff dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
          ))}
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  const totalStock = items.reduce((acc, i) => acc + i.stock, 0);
  const totalAvailable = items.reduce((acc, i) => acc + i.available_stock, 0);
  const totalBorrowed = totalStock - totalAvailable;

  const filteredItems = items
    .filter((i) => i.available_stock > 0)
    .filter(
      (i) =>
        i.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.item_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#142D4E] via-[#1B365D] to-[#0B1B30] p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-900/10 border border-white/10">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-48 -bottom-20 w-48 h-48 bg-[#06B6D4]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-cyan-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Petugas Laboratorium Komputer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Dashboard Operasional Staff
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
              Catat transaksi peminjaman alat mahasiswa atau dosen, proses pengembalian barang, dan pantau stok perangkat yang tersedia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/borrowing"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-800 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Form Peminjaman</span>
            </Link>
            <Link
              to="/returning"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 backdrop-blur-md active:scale-95 transition-all"
            >
              <ArrowDownLeft className="w-4 h-4 text-cyan-300" />
              <span>Pengembalian Barang</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Barang Lab"
          value={`${totalStock} Unit`}
          subtitle={`${items.length} Variasi jenis barang`}
          icon={Boxes}
          variant="primary"
        />
        <StatCard
          title="Barang Tersedia"
          value={`${totalAvailable} Unit`}
          subtitle="Dapat dipinjamkan sekarang"
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 'Tersedia', isPositive: true }}
        />
        <StatCard
          title="Sedang Dipinjam"
          value={`${totalBorrowed} Unit`}
          subtitle="Menunggu pengembalian"
          icon={Clock}
          variant="warning"
          trend={{ value: 'Dipinjam', isPositive: false }}
        />
        <StatCard
          title="Total Transaksi"
          value={`${borrowings.length} Kali`}
          subtitle="Riwayat peminjaman tercatat"
          icon={ArrowUpRight}
          variant="secondary"
        />
      </div>

      {/* Main Grid: Available Items & Recent Borrowings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Items List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(20,45,78,0.04)] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Daftar Barang Siap Pinjam</h3>
              <p className="text-xs text-slate-500 mt-0.5">Peralatan lab yang memiliki stok tersedia untuk digunakan</p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau kode..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Kode</th>
                  <th className="px-6 py-4">Nama Barang</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4 text-center">Stok Siap</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                      Tidak ada barang tersedia yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary-900">
                        {item.item_code}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{item.item_name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{item.description}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {item.category?.category_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {item.available_stock} dari {item.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to="/borrowing"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-secondary text-secondary hover:text-white transition active:scale-95 shadow-sm"
                        >
                          <span>Pinjamkan</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(20,45,78,0.04)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Aktivitas Terkini</h3>
              <p className="text-xs text-slate-500 mt-0.5">Transaksi peminjaman terbaru</p>
            </div>
            <Link to="/history" className="inline-flex items-center gap-0.5 text-xs font-bold text-secondary hover:text-blue-700">
              <span>Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px]">
            {borrowings.slice(0, 6).map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/60 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-primary-900 font-bold">
                    {b.borrowing_code}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">{b.borrower_name}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>{formatDate(b.borrowing_date)}</span>
                  <span className="text-slate-600 font-semibold">{b.details?.reduce((acc, d) => acc + d.quantity, 0)} barang</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
