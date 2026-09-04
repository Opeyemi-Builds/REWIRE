import { supabase, supabaseAdmin } from '../config/db.js';

// Create a new account via Supabase Auth, then create the matching profile row.
// Supabase's auth.users holds the credentials; the `profiles` table holds
// REWIRE-specific fields (name, level, total_score).
export async function signup(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name || null },
    },
  });

  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  // Create the profile row. Uses the admin client because the `profiles`
  // table has RLS enabled with no INSERT policy (see config/schema.sql) -
  // this is a trusted server-side operation right after signup.
  if (data.user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: data.user.id, name: name || null });

    // Ignore duplicate rows (e.g. retried signup); surface anything else.
    if (profileError && profileError.code !== '23505') {
      throw Object.assign(new Error(profileError.message), { status: 500 });
    }
  }

  return data; // { user, session }
}

// Log in with email/password. The returned session contains the access_token
// the frontend must send as `Authorization: Bearer <token>` on protected routes.
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw Object.assign(new Error(error.message), { status: 401 });

  return data; // { user, session }
}

// Resolve a user from an access token. Used by the auth middleware to protect routes.
export async function getUser(accessToken) {
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error) throw Object.assign(new Error(error.message), { status: 401 });

  return data.user;
}
