import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Download,
  History,
} from 'lucide-react';
import { api } from '../../services/api';
import { Borrowing } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';

export const HistoryPage: React.FC = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getBorrowings();
      setBorrowings(data);
    } catch (err) {
      console.error('Error fetching borrowings history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openDetail = (b: Borrowing) => {
    setSelectedBorrowing(b);
    setIsDetailModalOpen(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Kode Transaksi',
      'Peminjam',
      'Identitas',
      'Tanggal Pinjam',
      'Rencana Kembali',
      'Status',
      'Petugas',
      'Barang dan Jumlah',
    ];

    const rows = filteredBorrowings.map((b) => {
      const itemsStr = b.details
        ?.map((d) => `${d.item?.item_name || 'Barang'} (${d.quantity} unit)`)
        .join('; ');
      return [
        b.borrowing_code,
        `"${b.borrower_name}"`,
        b.borrower_identity || '-',
        formatDate(b.borrowing_date),
        formatDate(b.expected_return_date),
        b.status,
        b.creator?.full_name || 'Petugas Lab',
        `"${itemsStr}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat_transaksi_lab_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered borrowings
  const filteredBorrowings = borrowings.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch =
      b.borrower_name.toLowerCase().includes(q) ||
      b.borrowing_code.toLowerCase().includes(q) ||
      (b.borrower_identity && b.borrower_identity.toLowerCase().includes(q)) ||
      b.details?.some((d) => d.item?.item_name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(b.borrowing_date) >= new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(b.borrowing_date) <= end;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Riwayat Transaksi Laboratorium</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Arsip lengkap seluruh transaksi peminjaman dan pengembalian barang komputer laboratorium
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredBorrowings.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Laporan (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode, nama peminjam, atau nama barang..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Semua Status</option>
                <option value="Dipinjam">Dipinjam</option>
                <option value="Sebagian Dikembalikan">Sebagian Dikembalikan</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent focus:outline-none text-xs"
                title="Mulai Tanggal"
              />
              <span>-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent focus:outline-none text-xs"
                title="Sampai Tanggal"
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-red-500 hover:text-red-700 text-xs font-bold ml-1"
                  title="Reset Filter Tanggal"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={7} />
          </div>
        ) : filteredBorrowings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Tidak Ada Riwayat Transaksi"
              description="Tidak ada catatan transaksi peminjaman yang cocok dengan parameter filter Anda."
              icon={History}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Kode Transaksi</th>
                  <th className="px-5 py-3.5">Peminjam</th>
                  <th className="px-5 py-3.5">Barang yang Dipinjam</th>
                  <th className="px-5 py-3.5">Tgl Pinjam</th>
                  <th className="px-5 py-3.5">Tgl Kembali</th>
                  <th className="px-5 py-3.5">Petugas</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBorrowings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 font-mono font-bold text-primary-900">
                      {b.borrowing_code}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{b.borrower_name}</p>
                      {b.borrower_identity && (
                        <p className="text-[11px] font-mono text-slate-400">NIM: {b.borrower_identity}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        {b.details?.slice(0, 2).map((d) => (
                          <p key={d.id} className="text-slate-700">
                            &bull; {d.item?.item_name} <span className="font-semibold text-slate-500">({d.quantity}x)</span>
                          </p>
                        ))}
                        {(b.details?.length || 0) > 2 && (
                          <p className="text-[10px] text-slate-400 font-medium">
                            +{ (b.details?.length || 0) - 2 } barang lainnya
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(b.borrowing_date)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(b.expected_return_date)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {b.creator?.full_name || 'Petugas Lab'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openDetail(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedBorrowing && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detail Transaksi: ${selectedBorrowing.borrowing_code}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">Peminjam:</span>
                <span className="font-bold text-slate-800">{selectedBorrowing.borrower_name}</span>
                {selectedBorrowing.borrower_identity && (
                  <span className="block text-[11px] text-slate-500">NIM: {selectedBorrowing.borrower_identity}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Tgl Pinjam:</span>
                <span className="font-semibold text-slate-700">{formatDate(selectedBorrowing.borrowing_date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Rencana Kembali:</span>
                <span className="font-semibold text-slate-700">{formatDate(selectedBorrowing.expected_return_date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Status:</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(selectedBorrowing.status)}`}>
                  {selectedBorrowing.status}
                </span>
              </div>
            </div>

            {selectedBorrowing.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Catatan / Keperluan:</span>
                <p className="text-slate-700">{selectedBorrowing.notes}</p>
              </div>
            )}

            <div>
              <h5 className="font-bold text-slate-800 mb-2">Rincian Barang yang Dipinjam</h5>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Kode Barang</th>
                      <th className="px-4 py-2.5">Nama Barang</th>
                      <th className="px-4 py-2.5 text-center">Jumlah Pinjam</th>
                      <th className="px-4 py-2.5 text-center">Telah Kembali</th>
                      <th className="px-4 py-2.5 text-center">Sisa Tanggungan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBorrowing.details?.map((detail) => {
                      const remaining = detail.quantity - detail.returned_quantity;
                      return (
                        <tr key={detail.id}>
                          <td className="px-4 py-3 font-mono font-bold text-primary-900">
                            {detail.item?.item_code}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {detail.item?.item_name}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-700">
                            {detail.quantity}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-600">
                            {detail.returned_quantity}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${remaining === 0 ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-800'}`}>
                              {remaining} unit
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

