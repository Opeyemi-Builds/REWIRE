// Trusted server reads/writes via the admin client - see the note in
// models/Module.js.
import { supabaseAdmin } from '../config/db.js';

export const Assessment = {
  async create({ userId, scenarioId, selectedAnswer, correct, score }) {
    // Uses the admin client: the `assessments` INSERT policy checks
    // auth.uid() = user_id, but this server has no user session attached to
    // the anon client, so auth.uid() would be null and the insert rejected.
    // Grading is a trusted server-side write, so we set user_id explicitly.
    const { data, error } = await supabaseAdmin
      .from('assessments')
      .insert({
        user_id: userId,
        scenario_id: scenarioId,
        selected_answer: selectedAnswer,
        correct,
        score,
      })
      .select()
      .single();
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },

  async findByUserAndScenario(userId, scenarioId) {
    const { data, error } = await supabaseAdmin
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .eq('scenario_id', scenarioId)
      .maybeSingle();
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },

  async findByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },

  // Each attempt with its scenario's skill category attached - powers the
  // per-category Fraud Prevention Skill Profile. Relies on the FK
  // assessments.scenario_id -> scenarios.id for the embedded join.
  async findByUserWithCategory(userId) {
    const { data, error } = await supabaseAdmin
      .from('assessments')
      .select('score, correct, scenario_id, scenarios(category)')
      .eq('user_id', userId);
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },

  // Attempt history with enough scenario context to render a review list.
  async findHistoryByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('assessments')
      .select(
        'id, selected_answer, correct, score, created_at, ' +
          'scenarios(id, title, category, difficulty)'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },
};
