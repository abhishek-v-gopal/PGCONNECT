import { createClient } from '@supabase/supabase-js'

export const getSupabase = (env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string }) =>
  createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
