import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Layers,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  TrendingUp,
  PlusCircle,
  BarChart3,
  PieChart as PieIcon,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { api } from '../../services/api';
import { DashboardSummary } from '../../types';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';

const CHART_COLORS = ['#142D4E', '#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6'];

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
          ))}
        </div>
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  const maxBorrowedCount = Math.max(...summary.top_borrowed.map((t) => t.times_borrowed), 1);

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Top Welcome SaaS Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#142D4E] via-[#1B365D] to-[#0F233D] p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-900/10 border border-white/10">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-48 -bottom-20 w-48 h-48 bg-[#06B6D4]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-cyan-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pusat Kendali Lab &bull; Enterprise SaaS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Dashboard Administrator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
              Pantau ketersediaan barang inventaris, monitoring aktivitas peminjaman mahasiswa, dan kelola operasional laboratorium komputer secara realtime.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/inventory"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-800 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Kelola Barang</span>
            </Link>
            <Link
              to="/borrowing"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 backdrop-blur-md active:scale-95 transition-all"
            >
              <ArrowUpRight className="w-4 h-4 text-cyan-300" />
              <span>Peminjaman Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Barang (Fisik)"
          value={`${summary.total_items} Unit`}
          subtitle={`${summary.total_categories} Kategori terdaftar`}
          icon={Boxes}
          variant="primary"
          trend={{ value: '100% Tercatat', isPositive: true }}
        />
        <StatCard
          title="Barang Tersedia"
          value={`${summary.available_items} Unit`}
          subtitle="Siap untuk dipinjamkan"
          icon={CheckCircle}
          variant="success"
          trend={{ value: 'Ready', isPositive: true }}
        />
        <StatCard
          title="Sedang Dipinjam"
          value={`${summary.borrowed_items} Unit`}
          subtitle="Tercatat di luar lab"
          icon={Clock}
          variant="warning"
          trend={{ value: 'Aktif', isPositive: false }}
        />
        <StatCard
          title="Staff Laboran"
          value={`${summary.active_staff} Akun`}
          subtitle="Petugas operasional lab"
          icon={Users}
          variant="cyan"
          trend={{ value: 'Online', isPositive: true }}
        />
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(20,45,78,0.04)] hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kategori Inventaris</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{summary.total_categories} Kategori</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Komputer, Input, Output, Jaringan</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-700 rounded-2xl border border-slate-100">
            <Layers className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(20,45,78,0.04)] hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Peminjaman</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{summary.total_borrowings} Transaksi</h4>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Tervalidasi di database</p>
          </div>
          <div className="p-3 bg-blue-50 text-secondary rounded-2xl border border-blue-100">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(20,45,78,0.04)] hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pengembalian</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{summary.total_returns} Selesai</h4>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Stok pulih otomatis</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(20,45,78,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-secondary" />
                <h3 className="text-base font-extrabold text-slate-800">Distribusi Stok per Kategori</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Jumlah unit barang terdaftar berdasarkan kategori peralatan</p>
            </div>
            <span className="p-2 bg-blue-50 text-secondary rounded-xl text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Realtime</span>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.category_distribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="category_name"
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#142D4E',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(20, 45, 78, 0.2)',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  itemStyle={{ color: '#67E8F9' }}
                />
                <Bar dataKey="total_stock" name="Total Unit" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut / Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(20,45,78,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <PieIcon className="w-4 h-4 text-cyan-600" />
              <h3 className="text-base font-extrabold text-slate-800">Komposisi Kategori</h3>
            </div>
            <p className="text-xs text-slate-500">Proporsi jenis perangkat laboratorium</p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.category_distribution}
                  dataKey="total_stock"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {summary.category_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#142D4E',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {summary.category_distribution.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-slate-600 truncate max-w-[130px] font-medium">{c.category_name}</span>
                </div>
                <span className="font-bold text-slate-800">{c.total_stock} unit</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Activities & Top Borrowed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(20,45,78,0.04)] overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Aktivitas Peminjaman Terbaru</h3>
              <p className="text-xs text-slate-500 mt-0.5">Catatan peminjaman yang baru saja diproses oleh staff</p>
            </div>
            <Link
              to="/history"
              className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-blue-700 transition"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Kode Transaksi</th>
                  <th className="px-6 py-4">Peminjam</th>
                  <th className="px-6 py-4">Tanggal Pinjam</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.recent_activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                      Belum ada transaksi peminjaman terbaru.
                    </td>
                  </tr>
                ) : (
                  summary.recent_activities.map((act) => (
                    <tr key={act.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary-900">
                        {act.borrowing_code}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{act.borrower_name}</p>
                        <p className="text-[11px] text-slate-400">Petugas: {act.officer_name || 'Staff'}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {formatDate(act.borrowing_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(
                            act.status
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Borrowed Items Ranking */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(20,45,78,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-extrabold text-slate-800">Barang Terpopuler</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Top 5
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-5">Peralatan dengan frekuensi peminjaman tertinggi</p>

            <div className="space-y-4">
              {summary.top_borrowed.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-8">
                  Belum ada data peminjaman barang.
                </p>
              ) : (
                summary.top_borrowed.map((item, idx) => {
                  const percent = Math.round((item.times_borrowed / maxBorrowedCount) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-800">{item.item_name}</span>
                        </div>
                        <span className="font-extrabold text-secondary">{item.times_borrowed} kali</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              to="/inventory"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition"
            >
              <span>Cek Seluruh Inventaris Lab</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
