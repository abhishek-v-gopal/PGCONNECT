import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import { authMiddleware, requireRole } from '../middleware/auth'
import { verifyAccessToken } from '../lib/jwt'
import type { Env } from '../types'

export const inquiriesRouter = new Hono<Env>()

// POST /api/inquiries
inquiriesRouter.post('/', async (c) => {
  const supabase = getSupabase(c.env)
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  let userId: string | null = null

  if (token) {
    try {
      const user = await verifyAccessToken(token, c.env.SUPABASE_URL)
      userId = user.id
    } catch {
      userId = null
    }
  }

  const { property_id, name, phone, move_in, message } = await c.req.json()
  if (!property_id || !name || !phone) {
    return c.json({ success: false, message: 'property_id, name, and phone are required' }, 400)
  }

  const { data, error } = await supabase
    .from('inquiries')
    .insert({ property_id, user_id: userId, name, phone, move_in, message })
    .select()
    .single()

  if (error) return c.json({ success: false, message: error.message }, 500)

  const { error: incrementError } = await supabase.rpc('increment_inquiries', { prop_id: property_id })
  if (incrementError) console.error('[inquiries] increment_inquiries failed:', incrementError.message)

  return c.json({ success: true, message: 'Inquiry sent!', inquiry: data }, 201)
})

// GET /api/inquiries/owner
inquiriesRouter.get('/owner', authMiddleware, requireRole('owner', 'admin'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)

  const { data: myProps } = await supabase.from('properties').select('id').eq('owner_id', user.id)
  const propIds = myProps?.map((p: { id: string }) => p.id) ?? []

  if (!propIds.length) return c.json({ success: true, count: 0, inquiries: [] })

  const { data, error } = await supabase
    .from('inquiries')
    .select('*, properties(id, name, city)')
    .in('property_id', propIds)
    .order('created_at', { ascending: false })

  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, count: data?.length ?? 0, inquiries: data ?? [] })
})

// PATCH /api/inquiries/:id
inquiriesRouter.patch('/:id', authMiddleware, async (c) => {
  const supabase = getSupabase(c.env)
  const { status } = await c.req.json()

  const { data, error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', c.req.param('id'))
    .select()
    .single()

  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, message: 'Inquiry updated', inquiry: data })
})
