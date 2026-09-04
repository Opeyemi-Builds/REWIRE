import { supabase } from '../config/db.js';

export const Module = {
  async findAll() {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw Object.assign(new Error(error.message), { status: 404 });
    return data;
  },
};
