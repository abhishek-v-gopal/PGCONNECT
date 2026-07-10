import { createMiddleware } from 'hono/factory'
import { getSupabase } from '../lib/supabase'
import { verifyAccessToken } from '../lib/jwt'
import type { Env } from '../types'

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return c.json({ success: false, error: 'Unauthorized' }, 401)

  let user: { id: string; email?: string }
  try {
    user = await verifyAccessToken(token, c.env.SUPABASE_URL)
  } catch {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401)
  }

  const supabase = getSupabase(c.env)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_active) {
    return c.json({ success: false, error: 'Account is disabled' }, 403)
  }

  c.set('user', { ...profile, email: user.email! })
  await next()
})

export const requireRole = (...roles: string[]) =>
  createMiddleware<Env>(async (c, next) => {
    const user = c.get('user')
    if (!user || !roles.includes(user.role)) {
      return c.json({ success: false, error: 'Forbidden: insufficient permissions' }, 403)
    }
    await next()
  })
