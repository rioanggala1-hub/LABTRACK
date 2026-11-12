import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  User,
  Hash,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { Item, Borrowing } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';

interface ItemSelectionRow {
  item_id: string;
  quantity: number;
}

export const BorrowingPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeBorrowing, setActiveBorrowing] = useState<Borrowing | null>(null);

  // Form State
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerIdentity, setBorrowerIdentity] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<ItemSelectionRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [borrowData, itemsData] = await Promise.all([
        api.getBorrowings(),
        api.getItems(),
      ]);
      setBorrowings(borrowData);
      setItems(itemsData);
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

  const openNewBorrowingModal = () => {
    const availableItems = items.filter((i) => i.available_stock > 0);
    if (availableItems.length === 0) {
      showToast({
        type: 'warning',
        title: 'Tidak Ada Stok Tersedia',
        message: 'Saat ini semua barang laboratorium sedang habis atau dipinjam.',
      });
      return;
    }

    setBorrowerName('');
    setBorrowerIdentity('');
    setExpectedReturnDate('');
    setNotes('');
    setSelectedItems([{ item_id: availableItems[0].id, quantity: 1 }]);
    setFormError(null);
    setIsNewModalOpen(true);
  };

  const addItemRow = () => {
    const availableItems = items.filter((i) => i.available_stock > 0);
    // Find item not yet selected
    const unselected = availableItems.find(
      (ai) => !selectedItems.some((si) => si.item_id === ai.id)
    );
    const idToUse = unselected ? unselected.id : availableItems[0].id;
    setSelectedItems([...selectedItems, { item_id: idToUse, quantity: 1 }]);
  };

  const removeItemRow = (index: number) => {
    if (selectedItems.length <= 1) return;
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: 'item_id' | 'quantity', value: any) => {
    const updated = [...selectedItems];
    if (field === 'quantity') {
      const parsed = parseInt(value) || 1;
      updated[index].quantity = parsed < 1 ? 1 : parsed;
    } else {
      updated[index].item_id = value;
    }
    setSelectedItems(updated);
  };

  const handleCreateBorrowing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim()) {
      setFormError('Nama peminjam wajib diisi.');
      return;
    }
    if (selectedItems.length === 0) {
      setFormError('Pilih minimal satu barang untuk dipinjam.');
      return;
    }

    // Validate stocks for all selected items
    for (const row of selectedItems) {
      const item = items.find((i) => i.id === row.item_id);
      if (!item) {
        setFormError('Barang tidak valid.');
        return;
      }
      if (row.quantity > item.available_stock) {
        setFormError(
          `Jumlah pinjam untuk "${item.item_name}" (${row.quantity}) melebihi stok tersedia (${item.available_stock}).`
        );
        return;
      }
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await api.createBorrowing({
        borrower_name: borrowerName.trim(),
        borrower_identity: borrowerIdentity.trim() || undefined,
        expected_return_date: expectedReturnDate || undefined,
        notes: notes.trim() || undefined,
        items: selectedItems,
        userId: user?.id || 'admin',
      });

      showToast({
        type: 'success',
        title: 'Transaksi Peminjaman Berhasil',
        message: `Peminjaman atas nama ${borrowerName} berhasil dicatat dan stok telah otomatis berkurang.`,
      });

      setIsNewModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan transaksi peminjaman.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetailModal = (borrowing: Borrowing) => {
    setActiveBorrowing(borrowing);
    setIsDetailModalOpen(true);
  };

  // Filtered List
  const filteredBorrowings = borrowings.filter((b) => {
    const matchesSearch =
      b.borrower_name.toLowerCase().includes(search.toLowerCase()) ||
      b.borrowing_code.toLowerCase().includes(search.toLowerCase()) ||
      (b.borrower_identity && b.borrower_identity.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Transaksi Peminjaman Barang</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan peminjaman alat, validasi stok otomatis, dan monitoring status peminjaman
          </p>
        </div>
        <button
          onClick={openNewBorrowingModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Peminjaman Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode transaksi, nama peminjam, atau NIM..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition"
          />
        </div>

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
      </div>

      {/* Borrowings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : filteredBorrowings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Tidak Ada Data Peminjaman"
              description="Belum ada transaksi peminjaman yang cocok dengan pencarian Anda."
              icon={FileSpreadsheet}
              actionText="Catat Peminjaman Sekarang"
              onAction={openNewBorrowingModal}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Kode Peminjaman</th>
                  <th className="px-6 py-3.5">Peminjam</th>
                  <th className="px-6 py-3.5">Tanggal Pinjam</th>
                  <th className="px-6 py-3.5">Rencana Kembali</th>
                  <th className="px-6 py-3.5 text-center">Jumlah Barang</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBorrowings.map((b) => {
                  const totalItems = b.details?.reduce((acc, d) => acc + d.quantity, 0) || 0;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-primary-900">
                        {b.borrowing_code}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{b.borrower_name}</p>
                        {b.borrower_identity && (
                          <p className="text-[11px] font-mono text-slate-400">NIM/ID: {b.borrower_identity}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(b.borrowing_date)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(b.expected_return_date)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                          {totalItems} unit
                        </span>
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
                          onClick={() => openDetailModal(b)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-900 hover:bg-primary-100 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Borrowing Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Formulir Peminjaman Barang Laboratorium"
        description="Pilih barang dan jumlah yang ingin dipinjam. Stok akan divalidasi dan dipotong otomatis."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateBorrowing} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{formError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Peminjam *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="Nama mahasiswa / dosen"
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIM / Nomor Identitas (Opsional)
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={borrowerIdentity}
                  onChange={(e) => setBorrowerIdentity(e.target.value)}
                  placeholder="misal: 21051204011"
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rencana Tanggal Pengembalian
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keperluan / Catatan
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="misal: Praktikum Pemrograman Web Lab 2"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>
          </div>

          {/* Items Selector */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800">
                Pilih Barang yang Dipinjam ({selectedItems.length})
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Barang Lain</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto p-1">
              {selectedItems.map((row, index) => {
                const currentItem = items.find((i) => i.id === row.item_id);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex-1">
                      <select
                        value={row.item_id}
                        onChange={(e) => updateItemRow(index, 'item_id', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
                      >
                        {items.map((i) => (
                          <option key={i.id} value={i.id} disabled={i.available_stock === 0}>
                            {i.item_code} - {i.item_name} (Tersedia: {i.available_stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        min={1}
                        max={currentItem?.available_stock || 1}
                        value={row.quantity}
                        onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      disabled={selectedItems.length <= 1}
                      className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-30 transition"
                      title="Hapus baris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-primary-900 hover:bg-primary-800 rounded-xl shadow-sm transition disabled:opacity-60"
            >
              {submitting ? 'Menyimpan Transaksi...' : 'Konfirmasi Peminjaman'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Borrowing Detail Modal */}
      {activeBorrowing && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detail Peminjaman: ${activeBorrowing.borrowing_code}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">Peminjam:</span>
                <span className="font-bold text-slate-800">{activeBorrowing.borrower_name}</span>
                {activeBorrowing.borrower_identity && (
                  <span className="block text-[11px] text-slate-500">NIM: {activeBorrowing.borrower_identity}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Tgl Pinjam:</span>
                <span className="font-semibold text-slate-700">{formatDate(activeBorrowing.borrowing_date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Rencana Kembali:</span>
                <span className="font-semibold text-slate-700">{formatDate(activeBorrowing.expected_return_date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Status:</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(activeBorrowing.status)}`}>
                  {activeBorrowing.status}
                </span>
              </div>
            </div>

            {activeBorrowing.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Catatan / Keperluan:</span>
                <p className="text-slate-700">{activeBorrowing.notes}</p>
              </div>
            )}

            {/* Items details table */}
            <div>
              <h5 className="font-bold text-slate-800 mb-2">Daftar Barang yang Dipinjam</h5>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Kode</th>
                      <th className="px-4 py-2.5">Nama Barang</th>
                      <th className="px-4 py-2.5 text-center">Dipinjam</th>
                      <th className="px-4 py-2.5 text-center">Dikembalikan</th>
                      <th className="px-4 py-2.5 text-center">Sisa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeBorrowing.details?.map((detail) => {
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
                              {remaining}
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

