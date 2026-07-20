-- ════════════════════════════════════════════════════════════════
-- LUMORA ANALYTICS — SUPABASE POSTGRESQL DATABASE SCHEMA (₹ INR)
-- Project: lumora (tacegqonwgjbsfvbbtrc)
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- ════════════════════════════════════════════════════════════════

-- 1. ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Analyst',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  company TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
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
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  status TEXT DEFAULT 'Completed',
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SALES TABLE (REALTIME & DASHBOARD AGGREGATE)
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  revenue NUMERIC(15, 2) NOT NULL,
  profit NUMERIC(15, 2) NOT NULL,
  region TEXT NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- 8. CREATE PUBLIC READ POLICIES
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public read sales" ON public.sales FOR SELECT USING (true);

-- 9. ENABLE REALTIME ON SALES & ORDERS
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 10. INSERT SAMPLE SEED DATA (IN RUPEES ₹)
INSERT INTO public.users (name, email, role) VALUES
('Sarah Chen', 'sarah.chen@lumora.ai', 'VP of Operations'),
('Alex Morgan', 'alex.morgan@lumora.ai', 'Sales Manager')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.customers (customer_name, company, city, plan_tier, total_spent, health_score, status) VALUES
('Sarah Chen', 'Mahindra Group', 'Mumbai', 'Enterprise', 1420000.00, 98, 'Active'),
('Alex Morgan', 'Reliance Retail', 'Mumbai', 'Enterprise', 980000.00, 94, 'Active'),
('Priya Nair', 'Infosys Tech', 'Bengaluru', 'Growth', 420000.00, 89, 'Active'),
('David Kim', 'Swiggy Tech', 'Bengaluru', 'Starter', 128000.00, 76, 'Risk');

INSERT INTO public.products (product_name, category, price, active_sales, total_revenue) VALUES
('Lumora Enterprise Suite', 'Full Stack SaaS', 499999.00, 480, 24000000.00),
('Lumora Pro Analytics', 'Mid-Market SaaS', 49999.00, 1840, 16000000.00),
('API Data Stream Connector', 'Add-on Module', 19999.00, 3200, 6360000.00);

INSERT INTO public.orders (order_number, customer_name, total_amount, status) VALUES
('#ORD-9842', 'Mahindra Group', 240000.00, 'Completed'),
('#ORD-9841', 'Tata Digital', 98000.00, 'Completed'),
('#ORD-9840', 'Infosys Consulting', 450000.00, 'Processing');

INSERT INTO public.sales (revenue, profit, region) VALUES
(5000000.00, 1850000.00, 'Mumbai'),
(3000000.00, 1100000.00, 'Bengaluru'),
(1500000.00, 550000.00, 'Delhi NCR'),
(1000000.00, 370000.00, 'Hyderabad');
