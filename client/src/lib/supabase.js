import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const getAuthToken = async () => {
  const session = await getSession()
  return session?.access_token ?? null
}
