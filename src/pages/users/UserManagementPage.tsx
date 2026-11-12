import React, { useEffect, useState } from 'react';
import {
  UserPlus,
  Search,
  Shield,
  UserCheck,
  UserX,
  Edit2,
  Lock,
  Mail,
  User,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { UserProfile } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/formatters';

export const UserManagementPage: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();

  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<UserProfile | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllProfiles();
      setStaffList(data);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Memuat Pengguna',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setSelectedStaff(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (staff: UserProfile) => {
    setSelectedStaff(staff);
    setFullName(staff.full_name);
    setUsername(staff.username);
    setEmail(staff.email || `${staff.username}@labtrack.com`);
    setPassword('');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openDetailModal = (staff: UserProfile) => {
    setSelectedStaff(staff);
    setIsDetailModalOpen(true);
  };

  const openToggleModal = (staff: UserProfile) => {
    setSelectedStaff(staff);
    setIsToggleModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }
    if (!username.trim()) {
      setFormError('Username wajib diisi.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Format email tidak valid.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (selectedStaff) {
        // Edit staff profile
        await api.updateProfile(selectedStaff.id, {
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
        });
        showToast({
          type: 'success',
          title: 'Data Staff Diperbarui',
          message: `Profil ${fullName} berhasil diperbarui.`,
        });
      } else {
        // Add new staff
        await api.addStaff({
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password: password || 'StaffPass123!',
        });
        showToast({
          type: 'success',
          title: 'Staff Berhasil Ditambahkan',
          message: `Akun staff untuk ${fullName} telah aktif dan dapat digunakan.`,
        });
      }
      setIsFormModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedStaff) return;
    setSubmitting(true);
    try {
      await api.toggleStaffStatus(selectedStaff.id, selectedStaff.is_active);
      showToast({
        type: 'success',
        title: 'Status Akun Diubah',
        message: `Akun ${selectedStaff.full_name} kini ${
          selectedStaff.is_active ? 'dinonaktifkan' : 'diaktifkan'
        }.`,
      });
      setIsToggleModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Mengubah Status',
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  if (role !== 'admin') {
    return (
      <div className="p-8">
        <EmptyState
          title="Akses Dibatasi"
          description="Halaman manajemen pengguna dan staff hanya dapat diakses oleh Administrator Laboratorium."
          icon={Shield}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Manajemen Pengguna &amp; Staff</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola hak akses petugas laboran, penambahan akun, dan aktivasi status pengguna
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-800 text-white font-semibold text-xs shadow-md transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Staff</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, username, atau email..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition"
          />
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Total Pengguna: <strong>{filteredStaff.length}</strong> akun
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={6} />
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Tidak Ada Pengguna"
              description="Tidak ada data staff laboratorium yang sesuai dengan pencarian."
              icon={User}
              actionText="Tambah Staff Baru"
              onAction={openAddModal}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Nama Lengkap</th>
                  <th className="px-6 py-3.5">Username</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status Akun</th>
                  <th className="px-6 py-3.5">Tanggal Registrasi</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{staff.full_name}</p>
                      <p className="text-[11px] text-slate-400">{staff.email || `${staff.username}@labtrack.com`}</p>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-700">
                      @{staff.username}
                    </td>
                    <td className="px-6 py-4">
                      {staff.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                          <UserCheck className="w-3 h-3" /> Staff
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          staff.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {staff.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(staff.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetailModal(staff)}
                          className="p-1.5 text-slate-400 hover:text-primary-900 hover:bg-slate-100 rounded-lg transition"
                          title="Detail Pengguna"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(staff)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Data Staff"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Can't deactivate yourself or other admins */}
                        {staff.role !== 'admin' && (
                          <button
                            onClick={() => openToggleModal(staff)}
                            className={`p-1.5 rounded-lg transition ${
                              staff.is_active
                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={staff.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          >
                            {staff.is_active ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedStaff ? 'Edit Informasi Staff' : 'Tambah Akun Staff Laboran'}
        description="Akun staff memiliki akses operasional mencatat peminjaman dan pengembalian barang"
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{formError}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="misal: Budi Santoso, S.Kom"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              placeholder="misal: budi_lab"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="budi@labtrack.com"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                required
              />
            </div>
          </div>

          {!selectedStaff && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password Awal
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Default: StaffPass123!"
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Kosongkan untuk menggunakan password bawaan sistem.</p>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-primary-900 hover:bg-primary-800 rounded-xl shadow-sm transition disabled:opacity-60"
            >
              {submitting ? 'Menyimpan...' : selectedStaff ? 'Simpan Perubahan' : 'Buat Akun Staff'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detail Pengguna: ${selectedStaff.full_name}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-500">@{selectedStaff.username}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedStaff.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {selectedStaff.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <p className="font-bold text-sm text-slate-800">{selectedStaff.full_name}</p>
              <p className="text-slate-500">{selectedStaff.email || `${selectedStaff.username}@labtrack.com`}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Role Sistem:</span>
                <span className="font-bold text-slate-800 uppercase">{selectedStaff.role}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Terdaftar Sejak:</span>
                <span className="font-medium text-slate-700">{formatDate(selectedStaff.created_at)}</span>
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

      {/* Toggle Status Confirmation Dialog */}
      {selectedStaff && (
        <ConfirmDialog
          isOpen={isToggleModalOpen}
          onClose={() => setIsToggleModalOpen(false)}
          onConfirm={handleToggleStatus}
          title={selectedStaff.is_active ? 'Nonaktifkan Akun Staff' : 'Aktifkan Kembali Akun Staff'}
          message={`Apakah Anda yakin ingin ${
            selectedStaff.is_active ? 'menonaktifkan' : 'mengaktifkan kembali'
          } akun "${selectedStaff.full_name}" (@${selectedStaff.username})? ${
            selectedStaff.is_active
              ? 'Pengguna ini tidak akan dapat login atau melakukan peminjaman lagi sampai diaktifkan kembali.'
              : 'Pengguna ini akan dapat login kembali ke dalam sistem.'
          }`}
          confirmText={selectedStaff.is_active ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
          variant={selectedStaff.is_active ? 'danger' : 'primary'}
          isLoading={submitting}
        />
      )}
    </div>
  );
};

