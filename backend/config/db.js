import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Public client - respects Row Level Security (RLS). Used for most reads.
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client - BYPASSES Row Level Security. Only use this server-side,
// for trusted operations (e.g. creating a profile row right after signup).
// Never expose the service role key to the frontend.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
