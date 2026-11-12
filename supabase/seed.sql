-- Seed data for categories and items
INSERT INTO public.categories (id, category_name, description) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Komputer', 'Perangkat komputer utama seperti laptop, PC desktop, dan server lab'),
    ('11111111-1111-1111-1111-111111111102', 'Perangkat Input', 'Perangkat input periferal seperti keyboard, mouse, barcode scanner'),
    ('11111111-1111-1111-1111-111111111103', 'Perangkat Output', 'Perangkat output visual dan display seperti proyektor, monitor, printer'),
    ('11111111-1111-1111-1111-111111111104', 'Perangkat Jaringan', 'Perangkat konektivitas seperti switch, router, access point, kabel tester')
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO public.items (id, item_code, item_name, category_id, description, stock, available_stock, condition) VALUES
    ('22222222-2222-2222-2222-222222222201', 'BR001', 'Laptop Lenovo', '11111111-1111-1111-1111-111111111101', 'Laptop ThinkPad Core i5, RAM 16GB, SSD 512GB untuk lab pemrograman', 5, 5, 'Baik'),
    ('22222222-2222-2222-2222-222222222202', 'BR002', 'Mouse Logitech', '11111111-1111-1111-1111-111111111102', 'Mouse optic USB kabel tahan lama untuk praktikum', 10, 10, 'Baik'),
    ('22222222-2222-2222-2222-222222222203', 'BR003', 'Keyboard Mechanical', '11111111-1111-1111-1111-111111111102', 'Keyboard mechanical RGB blue switch untuk typing praktikum', 8, 8, 'Baik'),
    ('22222222-2222-2222-2222-222222222204', 'BR004', 'Proyektor Epson', '11111111-1111-1111-1111-111111111103', 'Proyektor multimedia 3600 lumens HDMI untuk presentasi lab', 3, 3, 'Baik'),
    ('22222222-2222-2222-2222-222222222205', 'BR005', 'Monitor LG', '11111111-1111-1111-1111-111111111103', 'Monitor LED 24 inch Full HD IPS 75Hz', 6, 6, 'Baik'),
    ('22222222-2222-2222-2222-222222222206', 'BR006', 'Cisco Switch 24-Port', '11111111-1111-1111-1111-111111111104', 'Manageable switch Gigabit untuk praktikum jaringan komputer', 4, 4, 'Baik'),
    ('22222222-2222-2222-2222-222222222207', 'BR007', 'MikroTik RouterBoard', '11111111-1111-1111-1111-111111111104', 'Routerboard RB951Ui untuk konfigurasi routing & firewall', 6, 6, 'Baik')
ON CONFLICT (item_code) DO NOTHING;

