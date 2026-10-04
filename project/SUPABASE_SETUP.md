# Supabase registration setup

The registration page uses Supabase Auth. Before running the app:

1. Open your Supabase project and copy the **Project URL** and **anon/public key** from Project Settings → API.
2. Put them in `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run the SQL migrations in `supabase/migrations/` (including `20261004100000_fix_auth_profile_creation.sql`).
4. Restart Vite after changing `.env`.

If the browser shows `Failed to fetch`, the browser cannot reach the configured Supabase URL. This is a network/configuration problem rather than a React form validation error.
