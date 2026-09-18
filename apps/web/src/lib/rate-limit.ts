import type { SupabaseClient } from "@supabase/supabase-js";

// Returns true if the request is under the limit, false if rate limited.
// Fails open on infra errors so a DB hiccup doesn't block legitimate requests.
export async function checkRateLimit(
  supabase: SupabaseClient,
  action: string,
  maxCalls: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_action: action,
    p_max_calls: maxCalls,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error(`[rate-limit] ${action}:`, error.message);
    return true;
  }

  return data === true;
}
