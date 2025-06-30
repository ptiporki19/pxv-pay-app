import { createClient } from '@supabase/supabase-js'

// This admin client is REQUIRED for any server-side operations that
// need to bypass RLS, such as creating notifications for other users
// or fetching user data with elevated privileges.
// It should only be used in server-side code (e.g., server actions, API routes).
export const createAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase URL or Service Role Key for admin client.')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
    auth: {
        // This is a service role client, so we don't need to persist sessions.
      autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
} 