import { createClient } from "@supabase/supabase-js";
import type { Database } from "@keyframe/types";

// Service-role client for server-side operations that need elevated permissions
// (e.g. credit refunds from API routes). Never import this in client components.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
