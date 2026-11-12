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

const PIE_COLORS = ['#1E3A5F', '#2563EB', '#38BDF8', '#818CF8', '#A78BFA'];

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

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-950 via-primary-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-primary-950/10">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-full text-blue-200">
            Pusat Kendali Inventaris
          </span>
          <h2 className="text-2xl font-black mt-2">Dashboard Administrator</h2>
          <p className="text-xs text-primary-200 mt-1 max-w-xl">
            Pantau ketersediaan barang, riwayat transaksi peminjaman, dan status staff secara komprehensif.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/inventory"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-blue-600 text-white font-semibold text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Kelola Barang</span>
          </Link>
          <Link
            to="/borrowing"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Peminjaman Baru</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Barang (Unit)"
          value={summary.total_items}
          subtitle={`${summary.total_categories} Kategori terdaftar`}
          icon={Boxes}
          variant="primary"
        />
        <StatCard
          title="Barang Tersedia"
          value={summary.available_items}
          subtitle="Siap untuk dipinjamkan"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Sedang Dipinjam"
          value={summary.borrowed_items}
          subtitle="Tercatat aktif di luar lab"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Staff Aktif"
          value={summary.active_staff}
          subtitle="Petugas pengelola lab"
          icon={Users}
          variant="secondary"
        />
      </div>

      {/* Secondary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kategori</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{summary.total_categories}</h4>
          </div>
          <div className="p-3 bg-slate-50 text-slate-700 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transaksi Peminjaman</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{summary.total_borrowings}</h4>
          </div>
          <div className="p-3 bg-blue-50 text-secondary rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pengembalian</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{summary.total_returns}</h4>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Distribusi Stok per Kategori</h3>
              <p className="text-xs text-slate-500 mt-0.5">Jumlah unit barang terdaftar berdasarkan kategori</p>
            </div>
            <span className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.category_distribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="category_name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="total_stock" name="Total Unit" fill="#1E3A5F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Komposisi Kategori</h3>
            <p className="text-xs text-slate-500 mt-0.5">Persentase jenis peralatan lab</p>
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
                  paddingAngle={4}
                >
                  {summary.category_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {summary.category_distribution.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-600 truncate max-w-[130px]">{c.category_name}</span>
                </div>
                <span className="font-semibold text-slate-800">{c.total_stock} unit</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Activities & Top Borrowed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Aktivitas Peminjaman Terbaru</h3>
              <p className="text-xs text-slate-500 mt-0.5">Transaksi peminjaman yang baru saja dicatat</p>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-secondary hover:underline"
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Kode Transaksi</th>
                  <th className="px-6 py-3.5">Peminjam</th>
                  <th className="px-6 py-3.5">Tanggal</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.recent_activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      Belum ada transaksi peminjaman.
                    </td>
                  </tr>
                ) : (
                  summary.recent_activities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">
                        {act.borrowing_code}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {act.borrower_name}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(act.borrowing_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(
                            act.status
                          )}`}
                        >
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

        {/* Top Borrowed Items */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-1">Barang Paling Sering Dipinjam</h3>
          <p className="text-xs text-slate-500 mb-4">Peringkat peralatan lab berdasarkan frekuensi</p>

          <div className="space-y-3 flex-1">
            {summary.top_borrowed.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center my-auto">
                Belum ada data barang dipinjam.
              </p>
            ) : (
              summary.top_borrowed.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-primary-900 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.item_name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{item.item_code}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-secondary rounded-lg">
                    {item.times_borrowed}x
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

