import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDB } from './storage';
import {
  Category,
  Item,
  Borrowing,
  UserProfile,
  ReturnHistory,
  DashboardSummary,
} from '../types';

export const api = {
  // Categories
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured) {
      return localDB.getCategories();
    }
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('category_name', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addCategory(name: string, description?: string): Promise<Category> {
    if (!isSupabaseConfigured) {
      return localDB.addCategory(name, description);
    }
    const { data, error } = await supabase
      .from('categories')
      .insert([{ category_name: name, description }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  // Items
  async getItems(): Promise<Item[]> {
    if (!isSupabaseConfigured) {
      return localDB.getItems();
    }
    const { data, error } = await supabase
      .from('items')
      .select('*, category:categories(*)')
      .order('item_code', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'available_stock'>): Promise<Item> {
    if (!isSupabaseConfigured) {
      return localDB.addItem(item);
    }
    const { data, error } = await supabase
      .from('items')
      .insert([{
        item_code: item.item_code,
        item_name: item.item_name,
        category_id: item.category_id,
        description: item.description,
        stock: item.stock,
        available_stock: item.stock,
        condition: item.condition,
      }])
      .select('*, category:categories(*)')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    if (!isSupabaseConfigured) {
      return localDB.updateItem(id, updates);
    }
    const { data, error } = await supabase
      .from('items')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteItem(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      localDB.deleteItem(id);
      return;
    }
    // Check if currently borrowed
    const { data: borrowedDetails, error: checkErr } = await supabase
      .from('borrowing_details')
      .select('id, quantity, returned_quantity, borrowings!inner(status)')
      .eq('item_id', id)
      .neq('borrowings.status', 'Selesai');

    if (checkErr) throw new Error(checkErr.message);
    const activeBorrow = (borrowedDetails || []).some(
      (d) => d.quantity > d.returned_quantity
    );
    if (activeBorrow) {
      throw new Error('Barang tidak dapat dihapus karena masih tercatat sedang dipinjam.');
    }

    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Borrowings
  async getBorrowings(): Promise<Borrowing[]> {
    if (!isSupabaseConfigured) {
      return localDB.getBorrowings();
    }
    const { data, error } = await supabase
      .from('borrowings')
      .select(`
        *,
        creator:profiles(id, full_name, username, role),
        details:borrowing_details(
          id, item_id, quantity, returned_quantity, created_at,
          item:items(id, item_code, item_name, condition, stock, available_stock)
        )
      `)
      .order('borrowing_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async createBorrowing(params: {
    borrower_name: string;
    borrower_identity?: string;
    expected_return_date?: string;
    notes?: string;
    items: { item_id: string; quantity: number }[];
    userId: string;
  }): Promise<any> {
    if (!isSupabaseConfigured) {
      return localDB.createBorrowing(params);
    }
    // Atomic stock deduction via PostgreSQL function / RPC
    const { data, error } = await supabase.rpc('borrow_items_atomic', {
      p_borrower_name: params.borrower_name,
      p_borrower_identity: params.borrower_identity || null,
      p_expected_return_date: params.expected_return_date || null,
      p_notes: params.notes || null,
      p_items: params.items,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // Returns
  async processReturn(params: {
    borrowing_id: string;
    returns: { borrowing_detail_id: string; quantity_to_return: number }[];
    notes?: string;
    userId: string;
  }): Promise<any> {
    if (!isSupabaseConfigured) {
      return localDB.processReturn(params);
    }
    // Atomic stock restoration & return history via PostgreSQL function / RPC
    const { data, error } = await supabase.rpc('return_items_atomic', {
      p_borrowing_id: params.borrowing_id,
      p_returns: params.returns,
      p_notes: params.notes || null,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async getReturnHistories(): Promise<ReturnHistory[]> {
    if (!isSupabaseConfigured) {
      return localDB.getReturnHistories();
    }
    const { data, error } = await supabase
      .from('return_history')
      .select(`
        *,
        processor:profiles(id, full_name, username),
        borrowing_detail:borrowing_details(
          id, quantity, returned_quantity,
          item:items(id, item_code, item_name),
          borrowing:borrowings(id, borrowing_code, borrower_name)
        )
      `)
      .order('return_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  // Users / Profiles
  async getStaffUsers(): Promise<UserProfile[]> {
    if (!isSupabaseConfigured) {
      return localDB.getProfiles().filter((p) => p.role === 'staff');
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'staff')
      .order('full_name', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getAllProfiles(): Promise<UserProfile[]> {
    if (!isSupabaseConfigured) {
      return localDB.getProfiles();
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('role', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addStaff(data: {
    username: string;
    full_name: string;
    email: string;
    password?: string;
  }): Promise<UserProfile> {
    if (!isSupabaseConfigured) {
      return localDB.addStaff(data);
    }
    // If Supabase is configured, create user via auth signUp or admin API
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: data.email,
      password: data.password || 'StaffPass123!',
      options: {
        data: {
          username: data.username,
          full_name: data.full_name,
          role: 'staff',
        },
      },
    });
    if (authErr) throw new Error(authErr.message);

    // Profile will be auto-created by the trigger
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
    if (profErr) {
      // Fallback manual profile insertion if trigger didn't run
      const { data: manualProfile, error: manErr } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user?.id,
          username: data.username,
          full_name: data.full_name,
          role: 'staff',
          is_active: true,
        }])
        .select()
        .single();
      if (manErr) throw new Error(manErr.message);
      return manualProfile;
    }
    return profile;
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!isSupabaseConfigured) {
      return localDB.updateProfile(id, updates);
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async toggleStaffStatus(id: string, currentStatus: boolean): Promise<UserProfile> {
    if (!isSupabaseConfigured) {
      return localDB.toggleStaffStatus(id);
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_active: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  // Dashboard Stats
  async getDashboardSummary(): Promise<DashboardSummary> {
    if (!isSupabaseConfigured) {
      return localDB.getDashboardSummary();
    }
    // Attempt RPC first
    const { data, error } = await supabase.rpc('get_dashboard_summary');
    if (!error && data) {
      return data as DashboardSummary;
    }

    // Fallback: aggregate directly with client queries
    const [itemsRes, catRes, borrowRes, returnsRes, staffRes] = await Promise.all([
      supabase.from('items').select('id, item_code, item_name, category_id, stock, available_stock'),
      supabase.from('categories').select('id, category_name'),
      supabase.from('borrowings').select('id, borrowing_code, borrower_name, borrowing_date, status, created_by'),
      supabase.from('return_history').select('id'),
      supabase.from('profiles').select('id').eq('role', 'staff').eq('is_active', true),
    ]);

    const items = itemsRes.data || [];
    const categories = catRes.data || [];
    const borrowings = borrowRes.data || [];
    const returns = returnsRes.data || [];
    const staff = staffRes.data || [];

    const totalItems = items.reduce((sum, i) => sum + i.stock, 0);
    const availableItems = items.reduce((sum, i) => sum + i.available_stock, 0);

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
      total_items: 1,
    }));

    return {
      total_items: totalItems,
      total_categories: categories.length,
      available_items: availableItems,
      borrowed_items: totalItems - availableItems,
      total_borrowings: borrowings.length,
      total_returns: returns.length,
      active_staff: staff.length,
      category_distribution: categoryDistribution,
      recent_activities: recentActivities,
      top_borrowed: [],
    };
  },
};

