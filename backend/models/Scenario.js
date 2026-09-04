// Trusted server reads via the admin client - see the note in models/Module.js.
// Field selection (not RLS) is what hides correct_answer/explanation from the
// pre-submission read below.
import { supabaseAdmin } from '../config/db.js';

export const Scenario = {
  async findByModule(moduleId) {
    // correct_answer & explanation are intentionally excluded here -
    // they're only revealed after the user submits an answer.
    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .select('id, module_id, title, context, options, difficulty, category')
      .eq('module_id', moduleId);
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },

  // Full record, including the answer - used server-side only
  // (e.g. by scoringService when grading a submission).
  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw Object.assign(new Error(error.message), { status: 404 });
    return data;
  },

  // Just id + module_id for every scenario - used to compute per-module
  // progress without pulling full records.
  async findAllBrief() {
    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .select('id, module_id');
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },
};
