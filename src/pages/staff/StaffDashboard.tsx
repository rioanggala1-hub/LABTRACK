import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-950 via-primary-900 to-blue-950 p-6 rounded-3xl text-white shadow-xl shadow-primary-950/10">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-full text-blue-200">
            Staff Laboratorium Komputer
          </span>
          <h2 className="text-2xl font-black mt-2">Dashboard Operasional Staff</h2>
          <p className="text-xs text-primary-200 mt-1 max-w-xl">
            Catat peminjaman alat mahasiswa atau dosen, proses pengembalian, dan pantau stok barang lab yang tersedia.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/borrowing"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-blue-600 text-white font-semibold text-xs shadow-md transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Form Peminjaman</span>
          </Link>
          <Link
            to="/returning"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Pengembalian</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Barang Lab"
          value={totalStock}
          subtitle={`${items.length} Variasi jenis barang`}
          icon={Boxes}
          variant="primary"
        />
        <StatCard
          title="Barang Tersedia"
          value={totalAvailable}
          subtitle="Dapat dipinjamkan sekarang"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Sedang Dipinjam"
          value={totalBorrowed}
          subtitle="Menunggu pengembalian"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Total Transaksi"
          value={borrowings.length}
          subtitle="Riwayat peminjaman tercatat"
          icon={ArrowUpRight}
          variant="secondary"
        />
      </div>

      {/* Main Grid: Available Items & Recent Borrowings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Items List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Daftar Barang Siap Pinjam</h3>
              <p className="text-xs text-slate-500 mt-0.5">Barang dengan stok tersedia di laboratorium</p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari barang atau kode..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Kode</th>
                  <th className="px-6 py-3.5">Nama Barang</th>
                  <th className="px-6 py-3.5">Kategori</th>
                  <th className="px-6 py-3.5 text-center">Stok Tersedia</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Tidak ada barang tersedia yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">
                        {item.item_code}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{item.item_name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{item.description}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {item.category?.category_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {item.available_stock} dari {item.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to="/borrowing"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary/10 hover:bg-secondary text-secondary hover:text-white transition"
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
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Aktivitas Terkini</h3>
              <p className="text-xs text-slate-500 mt-0.5">Transaksi peminjaman terbaru</p>
            </div>
            <Link to="/history" className="text-xs font-semibold text-secondary hover:underline">
              Semua &rarr;
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px]">
            {borrowings.slice(0, 6).map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-500 font-medium">
                    {b.borrowing_code}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">{b.borrower_name}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{formatDate(b.borrowing_date)}</span>
                  <span>{b.details?.reduce((acc, d) => acc + d.quantity, 0)} barang</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

