// ════════════════════════════════════════════════════════════════
// LUMORA ANALYTICS — REAL-TIME SALES HOOK (hooks/useSales.ts)
// Real-time Postgres changes subscription hook for Lumora Analytics
// ════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface Sale {
  id: string;
  order_id?: string;
  revenue: number;
  profit: number;
  region: string;
  sale_date: string;
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Initial fetch
    async function fetchSales() {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("sale_date", { ascending: false });

      if (!error && data) {
        setSales(data as Sale[]);
      }
      setLoading(false);
    }

    fetchSales();

    // 2. Real-time Subscription
    const channel = supabase
      .channel("realtime-sales")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSales((prev) => [payload.new as Sale, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { sales, loading };
}
