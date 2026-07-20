# 📊 Lumora Analytics — Business Intelligence Dashboard

> **See Your Business Clearly. Grow With Confidence.**

Lumora Analytics is a modern, human-centered business intelligence platform engineered with **HTML/JS/CSS** (and ready for **Next.js + React + Tailwind CSS + Supabase**).

---

## ⚡ Supabase Project Integration

### Project Details
- **Project Name:** `lumora`
- **Project ID:** `tacegqonwgjbsfvbbtrc`
- **Supabase URL:** `https://tacegqonwgjbsfvbbtrc.supabase.co`
- **Region:** `ap-northeast-1 (Tokyo)`
- **Anon Public Key:** `sb_publishable_Xlynrw0UPR4FphVMeIm8cQ_stD3s`

---

## 🗄️ Database Setup (SQL Schema)

1. Open your Supabase Dashboard: **[https://supabase.com](https://supabase.com)**
2. Go to **SQL Editor** → **New Query**
3. Copy and execute the contents of `schema.sql`:

```sql
-- Create sales table with real-time support
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  revenue NUMERIC(15, 2) NOT NULL,
  profit NUMERIC(15, 2) NOT NULL,
  region TEXT NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
```

---

## 🛠️ Project Structure & Architecture

```text
lumora-dashboard/
│
├── index.html            # Main Dashboard Application HTML
├── style.css             # Theme System (#0D0F12, #121417, #2ECC71, Rupee ₹)
├── app.js                # App Engine, View Router & Supabase SDK Integration
├── schema.sql            # Complete PostgreSQL Database Schema
├── .env.local            # Supabase Environment Variables
│
├── lib/
│   └── supabase.ts       # TypeScript Supabase Client Module
│
└── hooks/
    └── useSales.ts       # React Custom Hook for Real-time Sales Updates
```

---

## 🔑 Environment Configuration (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tacegqonwgjbsfvbbtrc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Xlynrw0UPR4FphVMeIm8cQ_stD3s
```

---

## 🚀 Key Features

- 🔑 **Two-Login System:** Toggle between Admin (`sarah.chen@lumora.ai`) and Manager (`alex.morgan@lumora.ai`).
- 🔔 **Working Notification Bell:** Interactive dropdown tray with unread badge counter (`3` -> `0`) and clear triggers.
- 💰 **Rupee Currency System (₹):** Standardized business metrics in Rupees (₹50.0 Lakhs, ₹18.5 Lakhs).
- ⚡ **Supabase Real-time Integration:** Connected to Supabase project `lumora`.
