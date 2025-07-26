import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Monitor application analytics and user behaviour to feed back into the
 * Agent‑AI‑App‑Factory.  Uses Supabase as a data warehouse for events and
 * metrics.  This is a simplified example that fetches aggregated usage
 * statistics and returns them for analysis.
 */
export async function getAnalytics(appId: string): Promise<any> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.rpc('get_app_metrics', { app_id: appId });
  if (error) throw error;
  return data;
}