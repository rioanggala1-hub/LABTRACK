import React, { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  Search,
  CheckCircle2,
  Clock,
  History,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { Borrowing, ReturnHistory } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, formatDateTime, getStatusBadgeClass } from '../../utils/formatters';

interface ReturnInputState {
  [detailId: string]: number;
}

export const ReturningPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [returnHistories, setReturnHistories] = useState<ReturnHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState('');

  // Process Return Modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<ReturnInputState>({});
  const [returnNotes, setReturnNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bData, rData] = await Promise.all([
        api.getBorrowings(),
        api.getReturnHistories(),
      ]);
      setBorrowings(bData);
      setReturnHistories(rData);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Memuat Data',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openProcessModal = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    // Initialize default return inputs to the remaining quantities
    const initialInputs: ReturnInputState = {};
    for (const d of borrowing.details || []) {
      const remaining = d.quantity - d.returned_quantity;
      initialInputs[d.id] = remaining > 0 ? remaining : 0;
    }
    setReturnQuantities(initialInputs);
    setReturnNotes('');
    setFormError(null);
    setIsReturnModalOpen(true);
  };

  const handleQuantityChange = (detailId: string, val: string, max: number) => {
    const parsed = parseInt(val) || 0;
    const clamped = Math.max(0, Math.min(parsed, max));
    setReturnQuantities({
      ...returnQuantities,
      [detailId]: clamped,
    });
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrowing) return;

    const returnPayload = Object.entries(returnQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([detailId, qty]) => ({
        borrowing_detail_id: detailId,
        quantity_to_return: qty,
      }));

    if (returnPayload.length === 0) {
      setFormError('Masukkan jumlah barang yang akan dikembalikan (minimal 1 unit).');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await api.processReturn({
        borrowing_id: selectedBorrowing.id,
        returns: returnPayload,
        notes: returnNotes.trim() || undefined,
        userId: user?.id || 'admin',
      });

      showToast({
        type: 'success',
        title: 'Pengembalian Berhasil Diproses',
        message: `Stok telah otomatis bertambah kembali dan status transaksi diperbarui.`,
      });

      setIsReturnModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Gagal memproses pengembalian barang.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter unreturned borrowings
  const pendingBorrowings = borrowings.filter((b) => b.status !== 'Selesai');
  const filteredPending = pendingBorrowings.filter((b) => {
    return (
      b.borrower_name.toLowerCase().includes(search.toLowerCase()) ||
      b.borrowing_code.toLowerCase().includes(search.toLowerCase()) ||
      (b.borrower_identity && b.borrower_identity.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Manajemen Pengembalian Barang</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Proses pengembalian alat laboratorium (sebagian atau penuh) dan pemulihan stok otomatis
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'pending'
                ? 'bg-white text-primary-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Perlu Dikembalikan ({pendingBorrowings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'history'
                ? 'bg-white text-primary-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Pengembalian</span>
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <>
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari peminjam, kode, atau NIM..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition"
              />
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Menampilkan <strong>{filteredPending.length}</strong> transaksi aktif
            </span>
          </div>

          {/* Pending Returns Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6">
                <TableSkeleton rows={5} cols={6} />
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="Tidak Ada Tanggungan Pengembalian"
                  description="Seluruh transaksi peminjaman telah diselesaikan atau tidak ada yang sesuai pencarian."
                  icon={CheckCircle2}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Kode Transaksi</th>
                      <th className="px-6 py-3.5">Peminjam</th>
                      <th className="px-6 py-3.5">Tanggal Pinjam</th>
                      <th className="px-6 py-3.5">Daftar Barang &amp; Status</th>
                      <th className="px-6 py-3.5">Status Peminjaman</th>
                      <th className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPending.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-primary-900">
                          {b.borrowing_code}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{b.borrower_name}</p>
                          {b.borrower_identity && (
                            <p className="text-[11px] font-mono text-slate-400">NIM: {b.borrower_identity}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(b.borrowing_date)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {b.details?.map((d) => {
                              const remaining = d.quantity - d.returned_quantity;
                              return (
                                <div key={d.id} className="flex items-center gap-2 text-[11px]">
                                  <span className="font-medium text-slate-700">{d.item?.item_name}:</span>
                                  <span className="text-slate-400">
                                    {d.returned_quantity}/{d.quantity} kembali
                                  </span>
                                  {remaining > 0 && (
                                    <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded">
                                      sisa {remaining}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(
                              b.status
                            )}`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openProcessModal(b)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>Proses Kembali</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Return History Tab */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Log Riwayat Pengembalian</h3>
              <p className="text-xs text-slate-500 mt-0.5">Catatan audit seluruh pengembalian barang yang telah diproses</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Waktu Pengembalian</th>
                  <th className="px-6 py-3.5">Barang</th>
                  <th className="px-6 py-3.5 text-center">Jumlah Dikembalikan</th>
                  <th className="px-6 py-3.5">Catatan / Kondisi</th>
                  <th className="px-6 py-3.5">Petugas Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returnHistories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Belum ada riwayat pengembalian yang tercatat.
                    </td>
                  </tr>
                ) : (
                  returnHistories.map((rh) => (
                    <tr key={rh.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {formatDateTime(rh.return_date)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">
                          {rh.borrowing_detail?.item?.item_name || 'Barang Lab'}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          Kode: {rh.borrowing_detail?.item?.item_code || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          +{rh.quantity_returned} unit
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {rh.notes || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {rh.processor?.full_name || 'Staff Laboran'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Process Return Modal */}
      {selectedBorrowing && (
        <Modal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          title={`Proses Pengembalian: ${selectedBorrowing.borrowing_code}`}
          description={`Peminjam: ${selectedBorrowing.borrower_name}`}
          maxWidth="lg"
        >
          <form onSubmit={handleReturnSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                Tentukan Jumlah Barang yang Dikembalikan:
              </label>

              {selectedBorrowing.details?.map((detail) => {
                const remaining = detail.quantity - detail.returned_quantity;
                const returnQty = returnQuantities[detail.id] || 0;
                return (
                  <div
                    key={detail.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {detail.item?.item_name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Dipinjam: {detail.quantity} &bull; Sudah kembali: {detail.returned_quantity} &bull;{' '}
                        <strong className="text-amber-700">Sisa: {remaining} unit</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Kembalikan:</span>
                      <input
                        type="number"
                        min={0}
                        max={remaining}
                        value={returnQty}
                        onChange={(e) =>
                          handleQuantityChange(detail.id, e.target.value, remaining)
                        }
                        className="w-20 px-2.5 py-1.5 text-xs font-bold text-center bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
                        disabled={remaining === 0}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Pemeriksaan Kondisi (Opsional)
              </label>
              <textarea
                rows={2}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="misal: Barang lengkap, kabel charger dan mouse dalam kondisi prima..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition disabled:opacity-60 flex items-center gap-2"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>{submitting ? 'Memproses...' : 'Konfirmasi Pengembalian'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

