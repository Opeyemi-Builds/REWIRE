import { supabase } from '../config/db.js';

export const Assessment = {
  async create({ userId, scenarioId, selectedAnswer, correct, score }) {
    const { data, error } = await supabase
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

  async findByUser(userId) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },
};
