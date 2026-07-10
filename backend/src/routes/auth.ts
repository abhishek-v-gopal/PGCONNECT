import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getSupabase } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import { generateReferralCode } from '../lib/referral'
import type { Env } from '../types'

export const authRouter = new Hono<Env>()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().min(1).max(80),
  last_name: z.string().min(1).max(80),
  role: z.enum(['student', 'owner']).default('student'),
  phone: z.string().optional(),
  university: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /api/auth/register
authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, first_name, last_name, role, phone, university } = c.req.valid('json')
  const supabase = getSupabase(c.env)

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error || !data.user) {
    return c.json({ success: false, message: error?.message ?? 'Registration failed' }, 400)
  }

  const referral_code = role === 'student' ? generateReferralCode() : null

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    first_name,
    last_name,
    role,
    phone,
    university,
    referral_code,
  })

  if (profileError) {
    await supabase.auth.admin.deleteUser(data.user.id)
    return c.json({ success: false, message: 'Failed to create profile' }, 500)
  }

  return c.json({
    success: true,
    message: 'Registration successful. Please check your email to confirm your account.',
    user: { id: data.user.id, email, first_name, last_name, role, referral_code },
    token: data.session?.access_token,
  }, 201)
})

// POST /api/auth/login
authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const supabase = getSupabase(c.env)

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    return c.json({ success: false, message: 'Invalid email or password' }, 401)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (!profile?.is_active) {
    return c.json({ success: false, message: 'Account has been disabled' }, 403)
  }

  await supabase
    .from('profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', data.user.id)

  let responseData: Record<string, unknown> = { ...profile, email: data.user.email }

  if (profile.role === 'owner') {
    const { data: properties } = await supabase
      .from('properties')
      .select('id, name, is_verified')
      .eq('owner_id', data.user.id)
    responseData.properties = properties ?? []
  }

  return c.json({
    success: true,
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: responseData,
  })
})

// POST /api/auth/logout
authRouter.post('/logout', authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '') ?? ''
  const supabase = getSupabase(c.env)
  await supabase.auth.admin.signOut(token)
  return c.json({ success: true, message: 'Logged out successfully' })
})

// GET /api/auth/me
authRouter.get('/me', authMiddleware, async (c) => {
  const user = c.get('user')
  return c.json({ success: true, user })
})

// PATCH /api/auth/update-password
authRouter.patch('/update-password', authMiddleware, async (c) => {
  const { new_password } = await c.req.json()
  if (!new_password || new_password.length < 6) {
    return c.json({ success: false, message: 'Password must be at least 6 characters' }, 400)
  }

  const supabase = getSupabase(c.env)
  const { error } = await supabase.auth.admin.updateUserById(c.get('user').id, {
    password: new_password,
  })

  if (error) return c.json({ success: false, message: error.message }, 400)
  return c.json({ success: true, message: 'Password updated successfully' })
})
