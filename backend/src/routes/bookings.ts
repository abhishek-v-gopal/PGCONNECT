import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import { authMiddleware, requireRole } from '../middleware/auth'
import type { Env } from '../types'

export const bookingsRouter = new Hono<Env>()

// POST /api/bookings
bookingsRouter.post('/', authMiddleware, requireRole('student', 'admin'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)
  const { property_id, room_type, move_in_date, monthly_rent, notes } = await c.req.json()

  if (!property_id || !room_type || !move_in_date || !monthly_rent) {
    return c.json({ success: false, message: 'property_id, room_type, move_in_date, monthly_rent are required' }, 400)
  }

  const { data: property } = await supabase.from('properties').select('status').eq('id', property_id).single()
  if (!property || property.status !== 'verified') {
    return c.json({ success: false, message: 'Property is not available for booking' }, 400)
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({ tenant_id: user.id, property_id, room_type, move_in_date, monthly_rent, notes })
    .select()
    .single()

  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, booking: data }, 201)
})

// GET /api/bookings/mine — tenant's bookings
bookingsRouter.get('/mine', authMiddleware, async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *, properties(id, name, address, city, starting_price,
        property_images(image_url, position))
    `)
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, count: data?.length ?? 0, bookings: data ?? [] })
})

// GET /api/bookings/owner — owner sees bookings for their properties
bookingsRouter.get('/owner', authMiddleware, requireRole('owner', 'admin'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)

  const { data: myProps } = await supabase.from('properties').select('id').eq('owner_id', user.id)
  const propIds = myProps?.map((p: { id: string }) => p.id) ?? []
  if (!propIds.length) return c.json({ success: true, count: 0, bookings: [] })

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      tenant:profiles!bookings_tenant_id_fkey(id, first_name, last_name, phone),
      properties(id, name, city)
    `)
    .in('property_id', propIds)
    .order('created_at', { ascending: false })

  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, count: data?.length ?? 0, bookings: data ?? [] })
})

// PATCH /api/bookings/:id — update booking status (owner/admin)
bookingsRouter.patch('/:id', authMiddleware, async (c) => {
  const supabase = getSupabase(c.env)
  const user = c.get('user')
  const { status, payment_status } = await c.req.json()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, properties(owner_id)')
    .eq('id', c.req.param('id'))
    .single()

  if (!booking) return c.json({ success: false, message: 'Booking not found' }, 404)

  const isOwner = (booking.properties as { owner_id: string })?.owner_id === user.id
  const isTenant = booking.tenant_id === user.id
  if (!isOwner && !isTenant && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not authorized' }, 403)
  }

  const updates: Record<string, string> = {}
  if (status) updates.status = status
  if (payment_status) updates.payment_status = payment_status

  const { data, error } = await supabase.from('bookings').update(updates).eq('id', booking.id).select().single()
  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, booking: data })
})
