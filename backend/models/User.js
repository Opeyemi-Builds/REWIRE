// Note: since we're using Supabase (Postgres) instead of MongoDB, these
// "model" files aren't Mongoose schemas - they're small query wrappers
// around the real Postgres tables defined in config/schema.sql.
//
// Trusted server reads/writes via the admin client - see the note in
// models/Module.js. Callers pass the authenticated user's id explicitly.
import { supabaseAdmin } from '../config/db.js';

export const User = {
  async findProfileById(id) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw Object.assign(new Error(error.message), { status: 404 });
    return data;
  },

  async updateScore(id, totalScore) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ total_score: totalScore })
      .eq('id', id)
      .select()
      .single();
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },

  // Persist both the running total and the derived level. Called after each
  // answer so the learner profile always reflects current performance.
  async updateProgress(id, { totalScore, level }) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ total_score: totalScore, level })
      .eq('id', id)
      .select()
      .single();
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },
};
