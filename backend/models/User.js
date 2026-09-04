import { supabase } from '../config/db.js';

// Note: since we're using Supabase (Postgres) instead of MongoDB, these
// "model" files aren't Mongoose schemas - they're small query wrappers
// around the real Postgres tables defined in config/schema.sql.

export const User = {
  async findProfileById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw Object.assign(new Error(error.message), { status: 404 });
    return data;
  },

  async updateScore(id, totalScore) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ total_score: totalScore })
      .eq('id', id)
      .select()
      .single();
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },
};
