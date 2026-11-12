import {
  Category,
  Item,
  Borrowing,
  UserProfile,
  ReturnHistory,
  DashboardSummary,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_ITEMS,
  INITIAL_PROFILES,
  INITIAL_BORROWINGS,
  INITIAL_RETURNS,
} from './mockData';

const KEYS = {
  CATEGORIES: 'labtrack_categories',
  ITEMS: 'labtrack_items',
  PROFILES: 'labtrack_profiles',
  BORROWINGS: 'labtrack_borrowings',
  RETURNS: 'labtrack_returns',
};

class LocalStorageDB {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }

  // Categories
  getCategories(): Category[] {
    return this.get<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  addCategory(name: string, description?: string): Category {
    const list = this.getCategories();
    const newCat: Category = {
      id: crypto.randomUUID(),
      category_name: name,
      description: description || null,
      created_at: new Date().toISOString(),
    };
    list.push(newCat);
    this.set(KEYS.CATEGORIES, list);
    return newCat;
  }

  // Items
  getItems(): Item[] {
    const categories = this.getCategories();
    const items = this.get<Item[]>(KEYS.ITEMS, INITIAL_ITEMS);
    return items.map((item) => ({
      ...item,
      category: categories.find((c) => c.id === item.category_id),
    }));
  }

  addItem(itemData: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'available_stock'>): Item {
    const items = this.get<Item[]>(KEYS.ITEMS, INITIAL_ITEMS);
    const existingCode = items.find(
      (i) => i.item_code.toLowerCase() === itemData.item_code.toLowerCase()
    );
    if (existingCode) {
      throw new Error(`Kode barang "${itemData.item_code}" sudah digunakan.`);
    }

    const newItem: Item = {
      ...itemData,
      id: crypto.randomUUID(),
      available_stock: itemData.stock,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    items.unshift(newItem);
    this.set(KEYS.ITEMS, items);
    return newItem;
  }

  updateItem(id: string, updates: Partial<Item>): Item {
    const items = this.get<Item[]>(KEYS.ITEMS, INITIAL_ITEMS);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Barang tidak ditemukan.');

    if (updates.item_code) {
      const existing = items.find(
        (i) => i.id !== id && i.item_code.toLowerCase() === updates.item_code!.toLowerCase()
      );
      if (existing) throw new Error(`Kode barang "${updates.item_code}" sudah digunakan.`);
    }

    const current = items[index];
    const stockDiff = updates.stock !== undefined ? updates.stock - current.stock : 0;
    const newAvailable = Math.max(0, current.available_stock + stockDiff);

    const updated: Item = {
      ...current,
      ...updates,
      available_stock: newAvailable,
      updated_at: new Date().toISOString(),
    };
    items[index] = updated;
    this.set(KEYS.ITEMS, items);
    return updated;
  }

  deleteItem(id: string): void {
    const borrowings = this.getBorrowings();
    const isCurrentlyBorrowed = borrowings.some((b) =>
      b.status !== 'Selesai' &&
      b.details?.some((d) => d.item_id === id && d.quantity > d.returned_quantity)
    );

    if (isCurrentlyBorrowed) {
      throw new Error('Barang tidak dapat dihapus karena sedang dipinjam.');
    }

    const items = this.get<Item[]>(KEYS.ITEMS, INITIAL_ITEMS);
    const filtered = items.filter((i) => i.id !== id);
    this.set(KEYS.ITEMS, filtered);
  }

  // Borrowings
  getBorrowings(): Borrowing[] {
    const borrowings = this.get<Borrowing[]>(KEYS.BORROWINGS, INITIAL_BORROWINGS);
    const items = this.getItems();
    const profiles = this.getProfiles();

    return borrowings.map((b) => ({
      ...b,
      creator: profiles.find((p) => p.id === b.created_by),
      details: b.details?.map((d) => ({
        ...d,
        item: items.find((i) => i.id === d.item_id),
      })),
    }));
  }

  createBorrowing(params: {
    borrower_name: string;
    borrower_identity?: string;
    expected_return_date?: string;
    notes?: string;
    items: { item_id: string; quantity: number }[];
    userId: string;
  }): Borrowing {
    const allItems = this.get<Item[]>(KEYS.ITEMS, INITIAL_ITEMS);

    // Validate stocks
    for (const req of params.items) {
      const found = allItems.find((i) => i.id === req.item_id);
      if (!found) throw new Error(`Barang ID ${req.item_id} tidak ditemukan.`);
      if (found.available_stock < req.quantity) {
        throw new Error(
          `Stok tidak cukup untuk ${found.item_name}. Tersedia: ${found.available_stock}, Diminta: ${req.quantity}`
        );
      }
    }

    // Generate code
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const borrowings = this.get<Borrowing[]>(KEYS.BORROWINGS, INITIAL_BORROWINGS);
    const count = borrowings.length + 1;
    const code = `BRW-${dateStr}-${String(count).padStart(4, '0')}`;

    const borrowingId = crypto.randomUUID();
    const details = params.items.map((it) => {
      // Deduct available stock
      const itemIdx = allItems.findIndex((i) => i.id === it.item_id);
      if (itemIdx !== -1) {
        allItems[itemIdx].available_stock -= it.quantity;
      }
      return {
        id: crypto.randomUUID(),
        borrowing_id: borrowingId,
        item_id: it.item_id,
        quantity: it.quantity,
        returned_quantity: 0,
        created_at: new Date().toISOString(),
      };
    });

    this.set(KEYS.ITEMS, allItems);

    const newBorrowing: Borrowing = {
      id: borrowingId,
      borrowing_code: code,
      borrower_name: params.borrower_name,
      borrower_identity: params.borrower_identity || null,
      borrowing_date: new Date().toISOString(),
      expected_return_date: params.expected_return_date || null,
      status: 'Dipinjam',
      notes: params.notes || null,
      created_by: params.userId,
      created_at: new Date().toISOString(),
      details,
    };

    borrowings.unshift(newBorrowing);
    this.set(KEYS.BORROWINGS, borrowings);

    return this.getBorrowings().find((b) => b.id === borrowingId)!;
  }

  // Returns
  processReturn(params: {
    borrowing_id: string;
    returns: { borrowing_detail_id: string; quantity_to_return: number }[];
    notes?: string;
    userId: string;
  }): Borrowing {
    const borrowings = this.get<Borrowing[]>(KEYS.BORROWINGS, INITIAL_BORROWINGS);
    const bIndex = borrowings.findIndex((b) => b.id === params.borrowing_id);
    if (bIndex === -1) throw new Error('Transaksi peminjaman tidak ditemukan.');

    const borrowing = borrowings[bIndex];
    const allItems = this.get<Item[]>(KEYS.ITEMS, INITIAL_ITEMS);
    const returnHistories = this.get<ReturnHistory[]>(KEYS.RETURNS, INITIAL_RETURNS);

    for (const ret of params.returns) {
      if (ret.quantity_to_return <= 0) continue;
      const detail = borrowing.details?.find((d) => d.id === ret.borrowing_detail_id);
      if (!detail) continue;

      const remaining = detail.quantity - detail.returned_quantity;
      if (ret.quantity_to_return > remaining) {
        throw new Error(
          `Jumlah pengembalian (${ret.quantity_to_return}) melebihi sisa yang dipinjam (${remaining}).`
        );
      }

      detail.returned_quantity += ret.quantity_to_return;

      // Increment available stock
      const itemIdx = allItems.findIndex((i) => i.id === detail.item_id);
      if (itemIdx !== -1) {
        allItems[itemIdx].available_stock += ret.quantity_to_return;
      }

      // Record history
      returnHistories.unshift({
        id: crypto.randomUUID(),
        borrowing_detail_id: detail.id,
        quantity_returned: ret.quantity_to_return,
        return_date: new Date().toISOString(),
        notes: params.notes || null,
        processed_by: params.userId,
        created_at: new Date().toISOString(),
      });
    }

    // Re-evaluate borrowing status
    let allReturned = true;
    let anyReturned = false;
    for (const d of borrowing.details || []) {
      if (d.returned_quantity > 0) anyReturned = true;
      if (d.returned_quantity < d.quantity) allReturned = false;
    }

    if (allReturned) {
      borrowing.status = 'Selesai';
    } else if (anyReturned) {
      borrowing.status = 'Sebagian Dikembalikan';
    } else {
      borrowing.status = 'Dipinjam';
    }

    borrowings[bIndex] = borrowing;
    this.set(KEYS.BORROWINGS, borrowings);
    this.set(KEYS.ITEMS, allItems);
    this.set(KEYS.RETURNS, returnHistories);

    return this.getBorrowings().find((b) => b.id === params.borrowing_id)!;
  }

  getReturnHistories(): ReturnHistory[] {
    const list = this.get<ReturnHistory[]>(KEYS.RETURNS, INITIAL_RETURNS);
    const profiles = this.getProfiles();
    return list.map((r) => ({
      ...r,
      processor: profiles.find((p) => p.id === r.processed_by),
    }));
  }

  // Profiles / Users
  getProfiles(): UserProfile[] {
    return this.get<UserProfile[]>(KEYS.PROFILES, INITIAL_PROFILES);
  }

  addStaff(data: { username: string; full_name: string; email: string }): UserProfile {
    const list = this.getProfiles();
    if (list.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
      throw new Error(`Username "${data.username}" sudah digunakan.`);
    }
    const newStaff: UserProfile = {
      id: crypto.randomUUID(),
      username: data.username,
      full_name: data.full_name,
      email: data.email,
      role: 'staff',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.push(newStaff);
    this.set(KEYS.PROFILES, list);
    return newStaff;
  }

  updateProfile(id: string, updates: Partial<UserProfile>): UserProfile {
    const list = this.getProfiles();
    const index = list.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('Pengguna tidak ditemukan.');

    const updated = {
      ...list[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    list[index] = updated;
    this.set(KEYS.PROFILES, list);
    return updated;
  }

  toggleStaffStatus(id: string): UserProfile {
    const list = this.getProfiles();
    const user = list.find((u) => u.id === id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');
    if (user.role === 'admin') throw new Error('Akun Admin tidak dapat dinonaktifkan.');

    user.is_active = !user.is_active;
    user.updated_at = new Date().toISOString();
    this.set(KEYS.PROFILES, list);
    return user;
  }

  // Dashboard Summary
  getDashboardSummary(): DashboardSummary {
    const items = this.getItems();
    const categories = this.getCategories();
    const borrowings = this.getBorrowings();
    const returns = this.getReturnHistories();
    const profiles = this.getProfiles();

    const totalItems = items.reduce((sum, i) => sum + i.stock, 0);
    const availableItems = items.reduce((sum, i) => sum + i.available_stock, 0);
    const borrowedItems = totalItems - availableItems;
    const activeStaff = profiles.filter((p) => p.role === 'staff' && p.is_active).length;

    const categoryDistribution = categories.map((cat) => {
      const catItems = items.filter((i) => i.category_id === cat.id);
      return {
        category_name: cat.category_name,
        item_count: catItems.length,
        total_stock: catItems.reduce((acc, cur) => acc + cur.stock, 0),
      };
    });

    const recentActivities = borrowings.slice(0, 8).map((b) => ({
      id: b.id,
      borrowing_code: b.borrowing_code,
      borrower_name: b.borrower_name,
      borrowing_date: b.borrowing_date,
      status: b.status,
      officer_name: b.creator?.full_name || 'Petugas Lab',
      total_items: b.details?.reduce((acc, d) => acc + d.quantity, 0) || 0,
    }));

    // Top borrowed items calculation
    const itemBorrowCounts: Record<string, { item_name: string; item_code: string; count: number }> = {};
    for (const b of borrowings) {
      for (const d of b.details || []) {
        if (!itemBorrowCounts[d.item_id]) {
          itemBorrowCounts[d.item_id] = {
            item_name: d.item?.item_name || 'Barang',
            item_code: d.item?.item_code || '',
            count: 0,
          };
        }
        itemBorrowCounts[d.item_id].count += d.quantity;
      }
    }

    const topBorrowed = Object.values(itemBorrowCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((t) => ({
        item_name: t.item_name,
        item_code: t.item_code,
        times_borrowed: t.count,
      }));

    return {
      total_items: totalItems,
      total_categories: categories.length,
      available_items: availableItems,
      borrowed_items: borrowedItems,
      total_borrowings: borrowings.length,
      total_returns: returns.length,
      active_staff: activeStaff,
      category_distribution: categoryDistribution,
      recent_activities: recentActivities,
      top_borrowed: topBorrowed,
    };
  }
}

export const localDB = new LocalStorageDB();

