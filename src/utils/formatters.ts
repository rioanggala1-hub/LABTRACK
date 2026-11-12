export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Dipinjam':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Sebagian Dikembalikan':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Selesai':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Baik':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Rusak Ringan':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Rusak Berat':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Aktif':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Nonaktif':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

