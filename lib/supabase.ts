// ════════════════════════════════════════════════════════════════
// LUMORA ANALYTICS — SUPABASE CLIENT SETUP (lib/supabase.ts)
// Project: lumora (tacegqonwgjbsfvbbtrc)
// ════════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tacegqonwgjbsfvbbtrc.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Xlynrw0UPR4FphVMeIm8cQ_stD3s";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
