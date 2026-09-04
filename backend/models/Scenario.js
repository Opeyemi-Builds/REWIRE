import { supabase } from '../config/db.js';

export const Scenario = {
  async findByModule(moduleId) {
    // correct_answer & explanation are intentionally excluded here -
    // they're only revealed after the user submits an answer.
    const { data, error } = await supabase
      .from('scenarios')
      .select('id, module_id, title, context, options, difficulty')
      .eq('module_id', moduleId);
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },

  // Full record, including the answer - used server-side only
  // (e.g. by scoringService when grading a submission).
  async findById(id) {
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw Object.assign(new Error(error.message), { status: 404 });
    return data;
  },
};
