import { createClient } from '@supabase/supabase-js';

export interface Analytics {
  activeUsers: number;
  sessions: number;
  revenue: number;
}

// Initialize Supabase client using service role to access RPC functions
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch application analytics from Supabase via a stored procedure. This function
 * assumes a Postgres function named `get_app_metrics` exists which returns
 * metrics for the given app ID. Adjust the RPC name and return type as needed.
 */
export async function getAnalytics(appId: string): Promise<Analytics> {
  const { data, error } = await supabase.rpc('get_app_metrics', { app_id: appId });
  if (error) {
    throw error;
  }
  return data as Analytics;
}
