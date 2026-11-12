export type UserRole = 'admin' | 'staff';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email?: string;
}

export interface Category {
  id: string;
  category_name: string;
  description: string | null;
  created_at: string;
}

export type ItemCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';

export interface Item {
  id: string;
  item_code: string;
  item_name: string;
  category_id: string;
  category?: Category;
  description: string | null;
  stock: number;
  available_stock: number;
  condition: ItemCondition;
  created_at: string;
  updated_at: string;
}

export type BorrowingStatus = 'Dipinjam' | 'Sebagian Dikembalikan' | 'Selesai';

export interface BorrowingDetail {
  id: string;
  borrowing_id: string;
  item_id: string;
  item?: Item;
  quantity: number;
  returned_quantity: number;
  created_at: string;
}

export interface Borrowing {
  id: string;
  borrowing_code: string;
  borrower_name: string;
  borrower_identity: string | null;
  borrowing_date: string;
  expected_return_date: string | null;
  status: BorrowingStatus;
  notes: string | null;
  created_by: string | null;
  creator?: UserProfile;
  created_at: string;
  details?: BorrowingDetail[];
}

export interface ReturnHistory {
  id: string;
  borrowing_detail_id: string;
  borrowing_detail?: BorrowingDetail;
  quantity_returned: number;
  return_date: string;
  notes: string | null;
  processed_by: string | null;
  processor?: UserProfile;
  created_at: string;
}

export interface DashboardSummary {
  total_items: number;
  total_categories: number;
  available_items: number;
  borrowed_items: number;
  total_borrowings: number;
  total_returns: number;
  active_staff: number;
  category_distribution: {
    category_name: string;
    item_count: number;
    total_stock: number;
  }[];
  recent_activities: {
    id: string;
    borrowing_code: string;
    borrower_name: string;
    borrowing_date: string;
    status: BorrowingStatus;
    officer_name?: string;
    total_items: number;
  }[];
  top_borrowed: {
    item_name: string;
    item_code: string;
    times_borrowed: number;
  }[];
}

