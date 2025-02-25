"use client";

import { createClient } from "@/utils/supabase/client";

export async function getAccessTokenClient() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}
