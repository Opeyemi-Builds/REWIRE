import { supabase, supabaseAdmin } from '../config/db.js';

export const Certificate = {
  async create({ userId, score }) {
    // Placeholder verification URL for the MVP - swap for a real
    // verification page/route once one exists.
    const verificationUrl = `https://rewire.app/verify/${userId}`;

    // Uses the admin client because the `certificates` table has RLS enabled
    // with no INSERT policy (see config/schema.sql) - issuance is a trusted
    // server-side decision, not a user-initiated write.
    const { data, error } = await supabaseAdmin
      .from('certificates')
      .insert({ user_id: userId, score, verification_url: verificationUrl })
      .select()
      .single();
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },

  async findByUser(userId) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    return data;
  },
};
