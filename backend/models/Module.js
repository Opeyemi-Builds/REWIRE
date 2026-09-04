// This backend is a trusted server: it authenticates the user itself
// (middleware/authMiddleware.js) and never forwards the user's JWT to Supabase,
// so the anon client would count as `anon` and be blocked by RLS. Reads go
// through the admin client; RLS remains the guard for any direct client access.
import { supabaseAdmin } from '../config/db.js';

export const Module = {
  async findAll() {
    const { data, error } = await supabaseAdmin
      .from('modules')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },

  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('modules')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw Object.assign(new Error(error.message), { status: 404 });
    return data;
  },
};
