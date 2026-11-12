-- ==============================================================================
-- LABORATORY INVENTORY & BORROWING MANAGEMENT SYSTEM (LabTrack)
-- COMPLETE DATABASE SETUP SCRIPT (SCHEMA + RLS + RPC + SEED)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE TABLES
-- ------------------------------------------------------------------------------
-- Table: profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- Table: categories
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- Table: items
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code TEXT UNIQUE NOT NULL,
    item_name TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    description TEXT,
    stock INTEGER NOT NULL CHECK (stock >= 0),
    available_stock INTEGER NOT NULL CHECK (available_stock >= 0 AND available_stock <= stock),
    condition TEXT NOT NULL DEFAULT 'Baik' CHECK (condition IN ('Baik', 'Rusak Ringan', 'Rusak Berat')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- Table: borrowings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.borrowings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrowing_code TEXT UNIQUE NOT NULL,
    borrower_name TEXT NOT NULL,
    borrower_identity TEXT,
    borrowing_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    expected_return_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'Dipinjam' CHECK (status IN ('Dipinjam', 'Sebagian Dikembalikan', 'Selesai')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- Table: borrowing_details
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.borrowing_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrowing_id UUID NOT NULL REFERENCES public.borrowings(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    returned_quantity INTEGER NOT NULL DEFAULT 0 CHECK (returned_quantity >= 0 AND returned_quantity <= quantity),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- Table: return_history
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.return_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrowing_detail_id UUID NOT NULL REFERENCES public.borrowing_details(id) ON DELETE CASCADE,
    quantity_returned INTEGER NOT NULL CHECK (quantity_returned > 0),
    return_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_items_category_id ON public.items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_item_code ON public.items(item_code);
CREATE INDEX IF NOT EXISTS idx_borrowings_borrowing_code ON public.borrowings(borrowing_code);
CREATE INDEX IF NOT EXISTS idx_borrowings_status ON public.borrowings(status);
CREATE INDEX IF NOT EXISTS idx_borrowings_created_by ON public.borrowings(created_by);
CREATE INDEX IF NOT EXISTS idx_borrowing_details_borrowing_id ON public.borrowing_details(borrowing_id);
CREATE INDEX IF NOT EXISTS idx_borrowing_details_item_id ON public.borrowing_details(item_id);
CREATE INDEX IF NOT EXISTS idx_return_history_detail_id ON public.return_history(borrowing_detail_id);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowing_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_history ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Active users can view profiles" ON public.profiles;
CREATE POLICY "Active users can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile name" ON public.profiles;
CREATE POLICY "Users can update own profile name"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Categories Policies
DROP POLICY IF EXISTS "Authenticated users can read categories" ON public.categories;
CREATE POLICY "Authenticated users can read categories"
  ON public.categories FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admin can insert categories" ON public.categories;
CREATE POLICY "Only admin can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can update categories" ON public.categories;
CREATE POLICY "Only admin can update categories"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Only admin can delete categories" ON public.categories;
CREATE POLICY "Only admin can delete categories"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- Items Policies
DROP POLICY IF EXISTS "Authenticated users can read items" ON public.items;
CREATE POLICY "Authenticated users can read items"
  ON public.items FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admin can insert items" ON public.items;
CREATE POLICY "Only admin can insert items"
  ON public.items FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can update items directly" ON public.items;
CREATE POLICY "Only admin can update items directly"
  ON public.items FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Only admin can delete items" ON public.items;
CREATE POLICY "Only admin can delete items"
  ON public.items FOR DELETE
  USING (public.is_admin());

-- Borrowings Policies
DROP POLICY IF EXISTS "Active users can read borrowings" ON public.borrowings;
CREATE POLICY "Active users can read borrowings"
  ON public.borrowings FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_active_user());

DROP POLICY IF EXISTS "Active users can insert borrowings" ON public.borrowings;
CREATE POLICY "Active users can insert borrowings"
  ON public.borrowings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND public.is_active_user());

DROP POLICY IF EXISTS "Active users can update borrowings" ON public.borrowings;
CREATE POLICY "Active users can update borrowings"
  ON public.borrowings FOR UPDATE
  USING (auth.role() = 'authenticated' AND public.is_active_user());

-- Borrowing Details Policies
DROP POLICY IF EXISTS "Active users can read borrowing details" ON public.borrowing_details;
CREATE POLICY "Active users can read borrowing details"
  ON public.borrowing_details FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_active_user());

DROP POLICY IF EXISTS "Active users can insert borrowing details" ON public.borrowing_details;
CREATE POLICY "Active users can insert borrowing details"
  ON public.borrowing_details FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND public.is_active_user());

DROP POLICY IF EXISTS "Active users can update borrowing details" ON public.borrowing_details;
CREATE POLICY "Active users can update borrowing details"
  ON public.borrowing_details FOR UPDATE
  USING (auth.role() = 'authenticated' AND public.is_active_user());

-- Return History Policies
DROP POLICY IF EXISTS "Active users can read return history" ON public.return_history;
CREATE POLICY "Active users can read return history"
  ON public.return_history FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_active_user());

DROP POLICY IF EXISTS "Active users can insert return history" ON public.return_history;
CREATE POLICY "Active users can insert return history"
  ON public.return_history FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND public.is_active_user());


-- 5. ATOMIC RPC FUNCTIONS (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
-- Function: borrow_items_atomic
-- Creates borrowing + details and decrements available_stock safely in one transaction.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.borrow_items_atomic(
    p_borrower_name TEXT,
    p_borrower_identity TEXT,
    p_expected_return_date TIMESTAMPTZ,
    p_notes TEXT,
    p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_is_active BOOLEAN;
    v_borrowing_id UUID;
    v_borrowing_code TEXT;
    v_item RECORD;
    v_item_id UUID;
    v_quantity INT;
    v_current_available INT;
    v_code_seq INT;
BEGIN
    -- 1. Check current authenticated user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: pengguna belum terautentikasi';
    END IF;

    SELECT is_active INTO v_is_active FROM public.profiles WHERE id = v_user_id;
    IF v_is_active IS NOT TRUE THEN
        RAISE EXCEPTION 'Akses ditolak: akun tidak aktif';
    END IF;

    -- 2. Validate input
    IF TRIM(p_borrower_name) = '' THEN
        RAISE EXCEPTION 'Nama peminjam wajib diisi';
    END IF;

    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Minimal harus memilih satu barang untuk dipinjam';
    END IF;

    -- 3. Generate unique borrowing code: BRW-YYYYMMDD-XXXX
    SELECT COUNT(*) + 1 INTO v_code_seq
    FROM public.borrowings
    WHERE borrowing_date::date = CURRENT_DATE;

    v_borrowing_code := 'BRW-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(v_code_seq::TEXT, 4, '0');

    -- 4. Create Borrowing header
    INSERT INTO public.borrowings (
        borrowing_code,
        borrower_name,
        borrower_identity,
        borrowing_date,
        expected_return_date,
        status,
        notes,
        created_by
    ) VALUES (
        v_borrowing_code,
        p_borrower_name,
        p_borrower_identity,
        now(),
        p_expected_return_date,
        'Dipinjam',
        p_notes,
        v_user_id
    ) RETURNING id INTO v_borrowing_id;

    -- 5. Loop items, lock rows, validate available stock, deduct stock, and insert details
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(item_id UUID, quantity INT)
    LOOP
        v_item_id := v_item.item_id;
        v_quantity := v_item.quantity;

        IF v_quantity <= 0 THEN
            RAISE EXCEPTION 'Jumlah pinjaman harus lebih dari 0';
        END IF;

        -- Lock row for update
        SELECT available_stock INTO v_current_available
        FROM public.items
        WHERE id = v_item_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Barang dengan ID % tidak ditemukan', v_item_id;
        END IF;

        IF v_current_available < v_quantity THEN
            RAISE EXCEPTION 'Stok tidak mencukupi untuk barang ID %. Tersedia: %, diminta: %',
                v_item_id, v_current_available, v_quantity;
        END IF;

        -- Deduct available stock
        UPDATE public.items
        SET available_stock = available_stock - v_quantity,
            updated_at = now()
        WHERE id = v_item_id;

        -- Insert detail
        INSERT INTO public.borrowing_details (
            borrowing_id,
            item_id,
            quantity,
            returned_quantity
        ) VALUES (
            v_borrowing_id,
            v_item_id,
            v_quantity,
            0
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'borrowing_id', v_borrowing_id,
        'borrowing_code', v_borrowing_code
    );
END;
$$;


-- ------------------------------------------------------------------------------
-- Function: return_items_atomic
-- Processes partial or full returns, updates detail returned_quantity, increments available_stock,
-- logs return history, and computes final borrowing status.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.return_items_atomic(
    p_borrowing_id UUID,
    p_returns JSONB,
    p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_is_active BOOLEAN;
    v_return RECORD;
    v_detail_id UUID;
    v_qty_to_return INT;
    v_current_detail RECORD;
    v_all_returned BOOLEAN := true;
    v_any_returned BOOLEAN := false;
    v_new_status TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: pengguna belum terautentikasi';
    END IF;

    SELECT is_active INTO v_is_active FROM public.profiles WHERE id = v_user_id;
    IF v_is_active IS NOT TRUE THEN
        RAISE EXCEPTION 'Akses ditolak: akun tidak aktif';
    END IF;

    -- Process each return item
    FOR v_return IN SELECT * FROM jsonb_to_recordset(p_returns) AS x(borrowing_detail_id UUID, quantity_to_return INT)
    LOOP
        v_detail_id := v_return.borrowing_detail_id;
        v_qty_to_return := v_return.quantity_to_return;

        IF v_qty_to_return > 0 THEN
            -- Lock detail row
            SELECT * INTO v_current_detail
            FROM public.borrowing_details
            WHERE id = v_detail_id AND borrowing_id = p_borrowing_id
            FOR UPDATE;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Detail peminjaman tidak ditemukan';
            END IF;

            IF (v_current_detail.quantity - v_current_detail.returned_quantity) < v_qty_to_return THEN
                RAISE EXCEPTION 'Jumlah pengembalian (%) melebihi sisa barang yang dipinjam (%)',
                    v_qty_to_return, (v_current_detail.quantity - v_current_detail.returned_quantity);
            END IF;

            -- Update returned quantity in detail
            UPDATE public.borrowing_details
            SET returned_quantity = returned_quantity + v_qty_to_return
            WHERE id = v_detail_id;

            -- Restore available stock in items
            UPDATE public.items
            SET available_stock = available_stock + v_qty_to_return,
                updated_at = now()
            WHERE id = v_current_detail.item_id;

            -- Record return history
            INSERT INTO public.return_history (
                borrowing_detail_id,
                quantity_returned,
                return_date,
                notes,
                processed_by
            ) VALUES (
                v_detail_id,
                v_qty_to_return,
                now(),
                p_notes,
                v_user_id
            );
        END IF;
    END LOOP;

    -- Evaluate overall borrowing status
    FOR v_current_detail IN
        SELECT quantity, returned_quantity FROM public.borrowing_details WHERE borrowing_id = p_borrowing_id
    LOOP
        IF v_current_detail.returned_quantity > 0 THEN
            v_any_returned := true;
        END IF;

        IF v_current_detail.returned_quantity < v_current_detail.quantity THEN
            v_all_returned := false;
        END IF;
    END LOOP;

    IF v_all_returned THEN
        v_new_status := 'Selesai';
    ELSIF v_any_returned THEN
        v_new_status := 'Sebagian Dikembalikan';
    ELSE
        v_new_status := 'Dipinjam';
    END IF;

    UPDATE public.borrowings
    SET status = v_new_status
    WHERE id = p_borrowing_id;

    RETURN jsonb_build_object(
        'success', true,
        'borrowing_id', p_borrowing_id,
        'status', v_new_status
    );
END;
$$;


-- ------------------------------------------------------------------------------
-- Function: get_dashboard_summary
-- Provides single-call fast aggregated data for admin & staff dashboards
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_items INT;
    v_total_categories INT;
    v_available_items INT;
    v_borrowed_items INT;
    v_total_borrowings INT;
    v_total_returns INT;
    v_active_staff INT;
    v_category_distribution JSONB;
    v_recent_activities JSONB;
    v_top_borrowed JSONB;
BEGIN
    SELECT COALESCE(SUM(stock), 0), COALESCE(SUM(available_stock), 0)
    INTO v_total_items, v_available_items
    FROM public.items;

    v_borrowed_items := v_total_items - v_available_items;

    SELECT COUNT(*) INTO v_total_categories FROM public.categories;
    SELECT COUNT(*) INTO v_total_borrowings FROM public.borrowings;
    SELECT COUNT(*) INTO v_total_returns FROM public.return_history;
    SELECT COUNT(*) INTO v_active_staff FROM public.profiles WHERE role = 'staff' AND is_active = true;

    -- Category distribution
    SELECT jsonb_agg(c) INTO v_category_distribution
    FROM (
        SELECT cat.category_name, COUNT(i.id) as item_count, COALESCE(SUM(i.stock), 0) as total_stock
        FROM public.categories cat
        LEFT JOIN public.items i ON i.category_id = cat.id
        GROUP BY cat.id, cat.category_name
        ORDER BY total_stock DESC
    ) c;

    -- Recent activities (last 8 borrowings)
    SELECT jsonb_agg(b) INTO v_recent_activities
    FROM (
        SELECT b.id, b.borrowing_code, b.borrower_name, b.borrowing_date, b.status,
               p.full_name as officer_name,
               (SELECT COUNT(*) FROM public.borrowing_details bd WHERE bd.borrowing_id = b.id) as total_items
        FROM public.borrowings b
        LEFT JOIN public.profiles p ON p.id = b.created_by
        ORDER BY b.created_at DESC
        LIMIT 8
    ) b;

    -- Top borrowed items
    SELECT jsonb_agg(t) INTO v_top_borrowed
    FROM (
        SELECT i.item_name, i.item_code, COALESCE(SUM(bd.quantity), 0) as times_borrowed
        FROM public.items i
        JOIN public.borrowing_details bd ON bd.item_id = i.id
        GROUP BY i.id, i.item_name, i.item_code
        ORDER BY times_borrowed DESC
        LIMIT 5
    ) t;

    RETURN jsonb_build_object(
        'total_items', v_total_items,
        'total_categories', v_total_categories,
        'available_items', v_available_items,
        'borrowed_items', v_borrowed_items,
        'total_borrowings', v_total_borrowings,
        'total_returns', v_total_returns,
        'active_staff', v_active_staff,
        'category_distribution', COALESCE(v_category_distribution, '[]'::jsonb),
        'recent_activities', COALESCE(v_recent_activities, '[]'::jsonb),
        'top_borrowed', COALESCE(v_top_borrowed, '[]'::jsonb)
    );
END;
$$;


-- 6. TRIGGER FOR AUTOMATIC PROFILE CREATION ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_username TEXT;
    v_full_name TEXT;
    v_role TEXT;
BEGIN
    v_username := COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1));
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', v_username);
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'staff');

    INSERT INTO public.profiles (id, username, full_name, role, is_active)
    VALUES (NEW.id, v_username, v_full_name, v_role, true)
    ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = now();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 7. INITIAL SEED DATA
-- Categories
INSERT INTO public.categories (id, category_name, description) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Komputer', 'Perangkat komputer utama seperti laptop, PC desktop, dan server lab'),
    ('11111111-1111-1111-1111-111111111102', 'Perangkat Input', 'Perangkat input periferal seperti keyboard, mouse, barcode scanner'),
    ('11111111-1111-1111-1111-111111111103', 'Perangkat Output', 'Perangkat output visual dan display seperti proyektor, monitor, printer'),
    ('11111111-1111-1111-1111-111111111104', 'Perangkat Jaringan', 'Perangkat konektivitas seperti switch, router, access point, kabel tester')
ON CONFLICT (category_name) DO NOTHING;

-- Initial Items (Sesuai Spesifikasi Tugas)
INSERT INTO public.items (id, item_code, item_name, category_id, description, stock, available_stock, condition) VALUES
    ('22222222-2222-2222-2222-222222222201', 'BR001', 'Laptop Lenovo', '11111111-1111-1111-1111-111111111101', 'Laptop ThinkPad Core i5, RAM 16GB, SSD 512GB untuk lab pemrograman', 5, 5, 'Baik'),
    ('22222222-2222-2222-2222-222222222202', 'BR002', 'Mouse Logitech', '11111111-1111-1111-1111-111111111102', 'Mouse optic USB kabel tahan lama untuk praktikum', 10, 10, 'Baik'),
    ('22222222-2222-2222-2222-222222222203', 'BR003', 'Keyboard Mechanical', '11111111-1111-1111-1111-111111111102', 'Keyboard mechanical RGB blue switch untuk typing praktikum', 8, 8, 'Baik'),
    ('22222222-2222-2222-2222-222222222204', 'BR004', 'Proyektor Epson', '11111111-1111-1111-1111-111111111103', 'Proyektor multimedia 3600 lumens HDMI untuk presentasi lab', 3, 3, 'Baik'),
    ('22222222-2222-2222-2222-222222222205', 'BR005', 'Monitor LG', '11111111-1111-1111-1111-111111111103', 'Monitor LED 24 inch Full HD IPS 75Hz', 6, 6, 'Baik'),
    ('22222222-2222-2222-2222-222222222206', 'BR006', 'Cisco Switch 24-Port', '11111111-1111-1111-1111-111111111104', 'Manageable switch Gigabit untuk praktikum jaringan komputer', 4, 4, 'Baik'),
    ('22222222-2222-2222-2222-222222222207', 'BR007', 'MikroTik RouterBoard', '11111111-1111-1111-1111-111111111104', 'Routerboard RB951Ui untuk konfigurasi routing & firewall', 6, 6, 'Baik')
ON CONFLICT (item_code) DO NOTHING;

