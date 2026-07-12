import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import { authMiddleware, requireRole } from '../middleware/auth'
import type { Env } from '../types'

export const paymentsRouter = new Hono<Env>()

const razorpayRequest = async (env: Env['Bindings'], path: string, method: string, body?: unknown) => {
  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json() as Promise<Record<string, unknown>>
}

const verifyRazorpaySignature = async (
  secret: string,
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> => {
  const message = `${orderId}|${paymentId}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  const generated = Array.from(new Uint8Array(sigBytes)).map((b) => b.toString(16).padStart(2, '0')).join('')
  return generated === signature
}

// POST /api/payments/create-order — tenant initiates monthly rent payment
paymentsRouter.post('/create-order', authMiddleware, requireRole('student'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)
  const { booking_id } = await c.req.json()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, properties(id, name, referred_by, commission_option)')
    .eq('id', booking_id)
    .eq('tenant_id', user.id)
    .single()

  if (!booking) return c.json({ success: false, message: 'Booking not found' }, 404)
  if (!['confirmed', 'active'].includes(booking.status)) {
    return c.json({ success: false, message: 'Booking is not active' }, 400)
  }

  const order = await razorpayRequest(c.env, '/orders', 'POST', {
    amount: Math.round(booking.monthly_rent * 100),
    currency: 'INR',
    receipt: `booking_${booking_id}_${Date.now()}`,
    notes: { booking_id, property_name: (booking.properties as { name: string })?.name },
  })

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      booking_id,
      tenant_id: user.id,
      property_id: booking.property_id,
      amount: booking.monthly_rent,
      razorpay_order_id: order.id,
      status: 'created',
      month: new Date().toISOString().slice(0, 7) + '-01',
    })
    .select()
    .single()

  if (error) return c.json({ success: false, message: error.message }, 500)

  return c.json({
    success: true,
    order_id: order.id,
    payment_id: payment.id,
    amount: booking.monthly_rent,
    currency: 'INR',
    key_id: c.env.RAZORPAY_KEY_ID,
  })
})

// POST /api/payments/verify — called after Razorpay checkout completes
paymentsRouter.post('/verify', authMiddleware, requireRole('student'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id } = await c.req.json()

  const valid = await verifyRazorpaySignature(
    c.env.RAZORPAY_KEY_SECRET,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  )
  if (!valid) return c.json({ success: false, message: 'Invalid payment signature' }, 400)

  const { data: payment } = await supabase
    .from('payments')
    .select('*, bookings(monthly_rent, property_id, properties(referred_by, commission_option))')
    .eq('id', payment_id)
    .eq('tenant_id', user.id)
    .single()

  if (!payment) return c.json({ success: false, message: 'Payment record not found' }, 404)

  const rent = payment.amount as number
  const platformFee = rent * 0.05
  const referrerCommission = rent * 0.02
  const platformRevenue = rent * 0.03
  const ownerPayout = rent * 0.95

  const property = (payment.bookings as { properties: { referred_by: string | null; commission_option: string } })?.properties
  const referredBy = property?.referred_by ?? null
  const commissionOption = property?.commission_option ?? 'recurring'

  await supabase.from('payments').update({
    razorpay_payment_id,
    status: 'paid',
    platform_fee: platformFee,
    referrer_commission: referrerCommission,
    platform_revenue: platformRevenue,
    owner_payout: ownerPayout,
  }).eq('id', payment_id)

  await supabase.from('bookings').update({ payment_status: 'paid', status: 'active' }).eq('id', payment.booking_id)

  if (referredBy) {
    // Check if one-time commission already paid
    let shouldPay = true
    if (commissionOption === 'one-time') {
      const { count } = await supabase
        .from('commissions')
        .select('id', { count: 'exact' })
        .eq('referrer_id', referredBy)
        .eq('property_id', payment.property_id)
        .eq('status', 'paid')
      shouldPay = (count ?? 0) === 0
    }

    if (shouldPay) {
      await supabase.from('commissions').insert({
        referrer_id: referredBy,
        property_id: payment.property_id,
        payment_id: payment_id,
        amount: referrerCommission,
        type: commissionOption,
        status: 'pending',
        month: payment.month,
      })

      await supabase.rpc('add_commission_balance', {
        referrer_id: referredBy,
        amount: referrerCommission,
      }).catch(() =>
        supabase.from('profiles').update({
          commission_balance: supabase.rpc('get_commission_balance', { uid: referredBy }) as unknown as number,
          total_commission_earned: supabase.rpc('get_total_earned', { uid: referredBy }) as unknown as number,
        }).eq('id', referredBy)
      )

      // Fallback: direct update if RPC not available
      const { data: refProfile } = await supabase
        .from('profiles')
        .select('commission_balance, total_commission_earned')
        .eq('id', referredBy)
        .single()
      if (refProfile) {
        await supabase.from('profiles').update({
          commission_balance: (refProfile.commission_balance ?? 0) + referrerCommission,
          total_commission_earned: (refProfile.total_commission_earned ?? 0) + referrerCommission,
        }).eq('id', referredBy)
      }
    }
  }

  return c.json({ success: true, message: 'Payment verified and recorded', owner_payout: ownerPayout })
})

// GET /api/payments/history — tenant
paymentsRouter.get('/history', authMiddleware, async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)

  const { data, error } = await supabase
    .from('payments')
    .select('*, properties(name, city), bookings(room_type)')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, payments: data ?? [] })
})

// GET /api/payments/owner-payouts
paymentsRouter.get('/owner-payouts', authMiddleware, requireRole('owner'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)

  const { data: myProps } = await supabase.from('properties').select('id').eq('owner_id', user.id)
  const propIds = myProps?.map((p: { id: string }) => p.id) ?? []
  if (!propIds.length) return c.json({ success: true, payouts: [], total: 0 })

  const { data, error } = await supabase
    .from('payments')
    .select('*, properties(name, city), bookings(room_type, tenant:profiles!bookings_tenant_id_fkey(first_name, last_name))')
    .in('property_id', propIds)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })

  if (error) return c.json({ success: false, message: error.message }, 500)
  const total = (data ?? []).reduce((s: number, p: { owner_payout: number }) => s + (p.owner_payout ?? 0), 0)
  return c.json({ success: true, payouts: data ?? [], total })
})

// POST /api/payments/webhook — Razorpay webhook
paymentsRouter.post('/webhook', async (c) => {
  const signature = c.req.header('X-Razorpay-Signature') ?? ''
  const rawBody = await c.req.text()

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(c.env.RAZORPAY_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const generated = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')

  if (generated !== signature) return c.json({ error: 'Invalid signature' }, 400)

  const event = JSON.parse(rawBody)
  if (event.event === 'payment.failed') {
    const supabase = getSupabase(c.env)
    const orderId = event.payload?.payment?.entity?.order_id
    if (orderId) {
      await supabase.from('payments').update({ status: 'failed' }).eq('razorpay_order_id', orderId)
    }
  }

  return c.json({ success: true })
})
