import { supabase, supabaseAdmin } from '../config/db.js';

export async function signUpUser({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  // supabase.auth.signUp() only creates the auth.users row (email/password).
  // We create the matching `profiles` row ourselves, using the admin client
  // so this write isn't blocked by Row Level Security.
  if (data.user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: data.user.id, name });

    if (profileError) {
      throw Object.assign(new Error(profileError.message), { status: 500 });
    }
  }

  return data;
}

export async function signInUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw Object.assign(new Error(error.message), { status: 401 });

  return data; // includes data.session.access_token, used as the Bearer token
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw Object.assign(new Error(error.message), { status: 404 });

  return data;
}
