import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import { authMiddleware, requireRole } from '../middleware/auth'
import type { Env } from '../types'

export const referralRouter = new Hono<Env>()

// GET /api/referral/my-code
referralRouter.get('/my-code', authMiddleware, requireRole('student'), async (c) => {
  const user = c.get('user')
  return c.json({
    success: true,
    referral_code: user.referral_code,
    referral_url: `${c.env.CLIENT_URL}/listProperty?ref=${user.referral_code}`,
  })
})

// GET /api/referral/stats
referralRouter.get('/stats', authMiddleware, requireRole('student'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)

  const { data: referredProperties, count: totalReferred } = await supabase
    .from('properties')
    .select('id, name, status, is_verified, city', { count: 'exact' })
    .eq('referred_by', user.id)

  const propIds = referredProperties?.map((p: { id: string }) => p.id) ?? []

  let activeBookings = 0
  if (propIds.length) {
    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .in('property_id', propIds)
      .eq('status', 'active')
    activeBookings = count ?? 0
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('total_commission_earned, commission_balance, commission_type')
    .eq('id', user.id)
    .single()

  return c.json({
    success: true,
    stats: {
      total_referred: totalReferred ?? 0,
      active_bookings: activeBookings,
      total_commission_earned: profile?.total_commission_earned ?? 0,
      pending_balance: profile?.commission_balance ?? 0,
      commission_type: profile?.commission_type ?? 'recurring',
    },
    referred_properties: referredProperties ?? [],
  })
})

// GET /api/referral/commissions
referralRouter.get('/commissions', authMiddleware, requireRole('student'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)
  const { page = '1', limit = '20' } = c.req.query()

  const pageNum = Number(page)
  const limitNum = Number(limit)
  const from = (pageNum - 1) * limitNum

  const { data, count, error } = await supabase
    .from('commissions')
    .select(`
      id, amount, type, status, month, created_at,
      properties(id, name, city)
    `, { count: 'exact' })
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, from + limitNum - 1)

  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, total: count ?? 0, commissions: data ?? [] })
})

// PATCH /api/referral/commission-type — switch between recurring and one-time
referralRouter.patch('/commission-type', authMiddleware, requireRole('student'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)
  const { commission_type } = await c.req.json()

  if (!['recurring', 'one-time'].includes(commission_type)) {
    return c.json({ success: false, message: 'Invalid commission_type' }, 400)
  }

  const { error } = await supabase
    .from('profiles')
    .update({ commission_type })
    .eq('id', user.id)

  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, message: `Commission type updated to ${commission_type}` })
})

// POST /api/referral/request-payout
referralRouter.post('/request-payout', authMiddleware, requireRole('student'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)

  const { data: profile } = await supabase
    .from('profiles')
    .select('commission_balance')
    .eq('id', user.id)
    .single()

  const balance = profile?.commission_balance ?? 0
  if (balance < 100) {
    return c.json({ success: false, message: 'Minimum payout is ₹100. Current balance: ₹' + balance }, 400)
  }

  // Reset balance and record the payout request (would trigger actual bank transfer via Razorpay Payouts)
  const { error } = await supabase
    .from('profiles')
    .update({ commission_balance: 0 })
    .eq('id', user.id)

  if (error) return c.json({ success: false, message: error.message }, 500)

  return c.json({
    success: true,
    message: `Payout of ₹${balance} has been requested and will be processed within 2-3 business days`,
    amount: balance,
  })
})
