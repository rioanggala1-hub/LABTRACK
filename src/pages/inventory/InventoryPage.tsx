import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  Package,
  Layers,
  
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { Item, Category, ItemCondition } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';

export const InventoryPage: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<Item | null>(null);

  // Form Fields
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState<number>(1);
  const [condition, setCondition] = useState<ItemCondition>('Baik');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [itemsData, catData] = await Promise.all([
        api.getItems(),
        api.getCategories(),
      ]);
      setItems(itemsData);
      setCategories(catData);
      if (catData.length > 0 && !categoryId) {
        setCategoryId(catData[0].id);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Memuat Inventaris',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openAddModal = () => {
    setActiveItem(null);
    setItemCode('');
    setItemName('');
    setDescription('');
    setStock(1);
    setCondition('Baik');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setActiveItem(item);
    setItemCode(item.item_code);
    setItemName(item.item_name);
    setCategoryId(item.category_id);
    setDescription(item.description || '');
    setStock(item.stock);
    setCondition(item.condition);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openDetailModal = (item: Item) => {
    setActiveItem(item);
    setIsDetailModalOpen(true);
  };

  const openDeleteModal = (item: Item) => {
    setActiveItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode.trim()) {
      setFormError('Kode barang wajib diisi.');
      return;
    }
    if (!itemName.trim()) {
      setFormError('Nama barang wajib diisi.');
      return;
    }
    if (stock < 0) {
      setFormError('Total stok tidak boleh bernilai negatif.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (activeItem) {
        // Edit Item
        await api.updateItem(activeItem.id, {
          item_code: itemCode.trim().toUpperCase(),
          item_name: itemName.trim(),
          category_id: categoryId,
          description: description.trim() || null,
          stock: Number(stock),
          condition,
        });
        showToast({
          type: 'success',
          title: 'Barang Diperbarui',
          message: `Barang ${itemName} berhasil disimpan.`,
        });
      } else {
        // Add Item
        await api.addItem({
          item_code: itemCode.trim().toUpperCase(),
          item_name: itemName.trim(),
          category_id: categoryId,
          description: description.trim() || null,
          stock: Number(stock),
          condition,
        });
        showToast({
          type: 'success',
          title: 'Barang Ditambahkan',
          message: `Barang ${itemName} berhasil ditambahkan ke inventaris.`,
        });
      }
      setIsFormModalOpen(false);
      await fetchInventory();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan data barang.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeItem) return;
    setSubmitting(true);
    try {
      await api.deleteItem(activeItem.id);
      showToast({
        type: 'success',
        title: 'Barang Dihapus',
        message: `Barang ${activeItem.item_name} berhasil dihapus dari sistem.`,
      });
      setIsDeleteModalOpen(false);
      await fetchInventory();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Menghapus Barang',
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      item.item_code.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || item.category_id === selectedCategory;

    const matchesAvailability =
      selectedAvailability === 'all' ||
      (selectedAvailability === 'available' && item.available_stock > 0) ||
      (selectedAvailability === 'unavailable' && item.available_stock === 0);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Manajemen Inventaris Barang
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {filteredItems.length} Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data perangkat keras, periferal lab, kondisi fisik, dan stok peralatan secara terpusat
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-800 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(20,45,78,0.03)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama barang, deskripsi, atau kode inventaris..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">Semua Ketersediaan</option>
              <option value="available">Tersedia (&gt; 0)</option>
              <option value="unavailable">Stok Habis (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(20,45,78,0.04)] overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={7} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Tidak Ada Barang Ditemukan"
              description="Tidak ada data barang inventaris yang cocok dengan filter atau kata kunci pencarian Anda."
              icon={Package}
              actionText={role === 'admin' ? 'Tambah Barang Sekarang' : undefined}
              onAction={role === 'admin' ? openAddModal : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Kode</th>
                  <th className="px-5 py-4">Nama Barang</th>
                  <th className="px-5 py-4">Kategori</th>
                  <th className="px-5 py-4 text-center">Total Stok</th>
                  <th className="px-5 py-4 text-center">Tersedia</th>
                  <th className="px-5 py-4 text-center">Dipinjam</th>
                  <th className="px-5 py-4">Kondisi</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const borrowedCount = item.stock - item.available_stock;
                  return (
                    <tr key={item.id} className="even:bg-slate-50/30 hover:bg-blue-50/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-primary-900">
                        {item.item_code}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{item.item_name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">
                          {item.description || '-'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {item.category?.category_name || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-slate-700">
                        {item.stock}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.available_stock > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.available_stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {item.available_stock}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-amber-700">
                        {borrowedCount}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
                            item.condition
                          )}`}
                        >
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail Button */}
                          <button
                            onClick={() => openDetailModal(item)}
                            className="p-1.5 text-slate-400 hover:text-primary-900 hover:bg-slate-100 rounded-lg transition"
                            title="Lihat Detail Barang"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Admin Only Actions */}
                          {role === 'admin' && (
                            <>
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Barang"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(item)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Hapus Barang"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={activeItem ? 'Edit Data Barang' : 'Tambah Barang Inventaris'}
        description="Pastikan kode barang unik dan informasi stok telah sesuai"
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{formError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Barang *
              </label>
              <input
                type="text"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value.toUpperCase())}
                placeholder="misal: BR001, LAP-01"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Barang *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Barang *
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="misal: Laptop Lenovo ThinkPad T490"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Stok Fisik *
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kondisi Fisik Barang
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi &amp; Spesifikasi Barang
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan spesifikasi teknis, kelengkapan kabel, charger, atau nomor seri..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-60"
            >
              {submitting ? 'Menyimpan...' : activeItem ? 'Simpan Perubahan' : 'Tambah Barang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Item Detail Modal */}
      {activeItem && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detail Barang: ${activeItem.item_code}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <h4 className="font-extrabold text-sm text-slate-800">{activeItem.item_name}</h4>
              <p className="text-slate-500 leading-relaxed">{activeItem.description || 'Tidak ada deskripsi.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Kategori:</span>
                <span className="font-semibold text-slate-800">{activeItem.category?.category_name || '-'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Kondisi:</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(activeItem.condition)}`}>
                  {activeItem.condition}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Total Stok Fisik:</span>
                <span className="font-bold text-slate-800">{activeItem.stock} unit</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Stok Tersedia:</span>
                <span className="font-bold text-emerald-600">{activeItem.available_stock} unit</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-[11px] space-y-1">
              <div>Ditambahkan pada: {formatDate(activeItem.created_at)}</div>
              <div>Terakhir diperbarui: {formatDate(activeItem.updated_at)}</div>
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

      {/* Delete Item Confirmation Dialog */}
      {activeItem && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Konfirmasi Hapus Barang"
          message={`Apakah Anda yakin ingin menghapus barang "${activeItem.item_name}" (${activeItem.item_code})? Barang yang sedang dipinjam tidak dapat dihapus.`}
          confirmText="Hapus Barang"
          variant="danger"
          isLoading={submitting}
        />
      )}
    </div>
  );
};
