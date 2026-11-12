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
      return 'bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-500/10';
    case 'Sebagian Dikembalikan':
      return 'bg-cyan-50 text-cyan-800 border-cyan-200/80 ring-1 ring-cyan-500/10';
    case 'Selesai':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10';
    case 'Baik':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10';
    case 'Rusak Ringan':
      return 'bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-500/10';
    case 'Rusak Berat':
      return 'bg-red-50 text-red-700 border-red-200/80 ring-1 ring-red-500/10';
    case 'Aktif':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10';
    case 'Nonaktif':
      return 'bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-400/10';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
