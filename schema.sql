-- ════════════════════════════════════════════════════════════════
-- LUMORA ANALYTICS — SUPABASE COMPLETE DATABASE SCHEMA & DATA
-- Project: lumora (tacegqonwgjbsfvbbtrc)
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- ════════════════════════════════════════════════════════════════

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PUBLIC USERS TABLE (PROFILES)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Analyst',
  initials TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  company TEXT NOT NULL,
  city TEXT NOT NULL,
  plan_tier TEXT NOT NULL DEFAULT 'Enterprise',
  total_spent NUMERIC(15, 2) DEFAULT 0.00,
  health_score INTEGER DEFAULT 90,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(15, 2) NOT NULL,
  active_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  status TEXT DEFAULT 'Completed',
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SALES TABLE (REALTIME AGGREGATE)
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  revenue NUMERIC(15, 2) NOT NULL,
  profit NUMERIC(15, 2) NOT NULL,
  region TEXT NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  icon TEXT DEFAULT '🔔',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 9. CREATE PUBLIC READ & WRITE POLICIES
CREATE POLICY "Allow public select users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public select customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public select products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public select sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Allow public select notifications" ON public.notifications FOR SELECT USING (true);

-- 10. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 11. INSERT SEED DATA FOR THE 2 USERS
INSERT INTO public.users (email, name, role, initials) VALUES
('sarah.chen@lumora.ai', 'Sarah Chen', 'VP of Operations (Admin)', 'SC'),
('alex.morgan@lumora.ai', 'Alex Morgan', 'Sales Manager', 'AM')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

-- 12. INSERT CUSTOMERS SEED DATA (IN RUPEES ₹)
INSERT INTO public.customers (customer_name, company, city, plan_tier, total_spent, health_score, status) VALUES
('Sarah Chen', 'Mahindra Group', 'Mumbai', 'Enterprise', 14200000.00, 98, 'Active'),
('Alex Morgan', 'Reliance Retail', 'Mumbai', 'Enterprise', 9800000.00, 94, 'Active'),
('Priya Nair', 'Infosys Tech', 'Bengaluru', 'Growth', 4200000.00, 89, 'Active'),
('David Kim', 'Swiggy Tech', 'Bengaluru', 'Starter', 1280000.00, 76, 'Risk')
ON CONFLICT DO NOTHING;

-- 13. INSERT PRODUCTS SEED DATA
INSERT INTO public.products (product_name, category, price, active_sales, total_revenue) VALUES
('Lumora Enterprise Suite', 'Full Stack SaaS', 499999.00, 480, 24000000.00),
('Lumora Pro Analytics', 'Mid-Market SaaS', 49999.00, 1840, 16000000.00),
('API Data Stream Connector', 'Add-on Module', 19999.00, 3200, 6360000.00)
ON CONFLICT DO NOTHING;

-- 14. INSERT ORDERS SEED DATA
INSERT INTO public.orders (order_number, customer_name, total_amount, status) VALUES
('#ORD-9842', 'Mahindra Group', 240000.00, 'Completed'),
('#ORD-9841', 'Tata Digital', 98000.00, 'Completed'),
('#ORD-9840', 'Infosys Consulting', 450000.00, 'Processing'),
('#ORD-9839', 'Zomato Tech', 120000.00, 'Completed')
ON CONFLICT DO NOTHING;

-- 15. INSERT NOTIFICATIONS SEED DATA
INSERT INTO public.notifications (title, subtitle, icon, is_read) VALUES
('Revenue Target Reached', 'Monthly target of ₹50.0 Lakhs achieved!', '💰', false),
('New Enterprise Client', 'Mahindra Group signed annual plan', '👥', false),
('AI Insight Alert', 'Demand spike forecast in Bengaluru', '🤖', false)
ON CONFLICT DO NOTHING;
