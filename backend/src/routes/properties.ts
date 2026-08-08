import { Hono } from 'hono'
import { cache } from 'hono/cache'
import { getSupabase } from '../lib/supabase'
import { authMiddleware, requireRole } from '../middleware/auth'
import { uploadToR2, deleteFromR2 } from '../lib/r2'
import type { Env } from '../types'

export const propertiesRouter = new Hono<Env>()

// Public, unauthenticated, identical response for everyone hitting the same
// URL — safe to edge-cache. Never apply this to an authenticated route: the
// cache key is just the URL, so it would leak one user's response to another.
const publicCache = cache({ cacheName: 'pgconnect-properties', cacheControl: 'public, max-age=30' })

// GET /api/properties — public, with filters
propertiesRouter.get('/', publicCache, async (c) => {
  const supabase = getSupabase(c.env)
  const { city, state, minPrice, maxPrice, gender, roomType, search, sort, page = '1', limit = '12' } = c.req.query()

  let query = supabase
    .from('properties')
    .select(`
      id, name, address, city, state, landmark, lat, lng,
      amenities, gender, starting_price, rating, total_ratings,
      status, is_verified, available_beds,
      property_images(image_url, position),
      property_rooms(type)
    `)
    .eq('status', 'verified')

  if (city) query = query.ilike('city', `%${city}%`)
  if (state) query = query.ilike('state', `%${state}%`)
  if (gender) query = query.eq('gender', gender)
  if (minPrice) query = query.gte('starting_price', Number(minPrice))
  if (maxPrice) query = query.lte('starting_price', Number(maxPrice))
  if (roomType) {
    const { data: roomPropertyIds } = await supabase
      .from('property_rooms')
      .select('property_id')
      .eq('type', roomType)
    const ids = roomPropertyIds?.map((r: { property_id: string }) => r.property_id) ?? []
    if (ids.length) query = query.in('id', ids)
    else return c.json({ success: true, total: 0, page: 1, pages: 0, properties: [] })
  }
  if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%,address.ilike.%${search}%`)

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    price_asc: { column: 'starting_price', ascending: true },
    price_desc: { column: 'starting_price', ascending: false },
    rating: { column: 'rating', ascending: false },
    newest: { column: 'created_at', ascending: false },
  }
  const s = sortMap[sort ?? 'newest'] ?? { column: 'created_at', ascending: false }
  query = query.order(s.column, { ascending: s.ascending })

  const pageNum = Number(page)
  const limitNum = Number(limit)
  const from = (pageNum - 1) * limitNum
  const to = from + limitNum - 1

  const { data: properties, count, error } = await query.range(from, to)
  if (error) return c.json({ success: false, message: error.message }, 500)

  return c.json({
    success: true,
    total: count ?? 0,
    page: pageNum,
    pages: Math.ceil((count ?? 0) / limitNum),
    properties: properties ?? [],
  })
})

// GET /api/properties/owner/mine — must come before /:id
propertiesRouter.get('/owner/mine', authMiddleware, requireRole('owner', 'admin'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)

  const { data, error } = await supabase
    .from('properties')
    .select(`
      *, property_images(image_key, image_url, position),
      property_rooms(*, beds(id, label, status))
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, count: data?.length ?? 0, properties: data ?? [] })
})

// GET /api/properties/:id
propertiesRouter.get('/:id', publicCache, async (c) => {
  const supabase = getSupabase(c.env)
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!properties_owner_id_fkey(id, first_name, last_name, phone, avatar),
      property_images(id, image_key, image_url, position),
      property_rooms(*)
    `)
    .eq('id', c.req.param('id'))
    .single()

  if (error || !property) return c.json({ success: false, message: 'Property not found' }, 404)

  // Don't make the visitor wait on this write — record the view in the background.
  c.executionCtx.waitUntil(
    Promise.resolve(supabase.from('properties').update({ views: (property.views ?? 0) + 1 }).eq('id', property.id))
  )

  return c.json({ success: true, property })
})

// POST /api/properties — owner creates listing
propertiesRouter.post('/', authMiddleware, requireRole('owner', 'admin'), async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)

  const contentType = c.req.header('content-type') ?? ''
  let body: Record<string, unknown>
  let imageFiles: File[] = []

  if (contentType.includes('multipart/form-data')) {
    const formData = await c.req.formData()
    body = {
      name: formData.get('name'),
      tagline: formData.get('tagline'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      landmark: formData.get('landmark'),
      lat: formData.get('lat') ? Number(formData.get('lat')) : undefined,
      lng: formData.get('lng') ? Number(formData.get('lng')) : undefined,
      gender: formData.get('gender'),
      amenities: formData.get('amenities'),
      rooms: formData.get('rooms'),
      manager_name: formData.get('manager_name'),
      manager_phone: formData.get('manager_phone'),
      referral_code: formData.get('referral_code'),
      agent_code: formData.get('agent_code'),
      commission_option: formData.get('commission_option'),
    }
    imageFiles = formData.getAll('images') as File[]
  } else {
    body = await c.req.json()
  }

  if (!body.name || !body.address || !body.city || !body.state) {
    return c.json({ success: false, message: 'name, address, city, and state are required' }, 400)
  }

  // Resolve referral code to referrer UUID
  let referredBy: string | null = null
  if (body.referral_code) {
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', body.referral_code)
      .eq('role', 'student')
      .single()
    referredBy = referrer?.id ?? null
  }

  // Resolve agent code to a verified agent UUID — unverified/invalid codes are silently ignored
  let agentId: string | null = null
  if (body.agent_code) {
    const { data: agent } = await supabase
      .from('profiles')
      .select('id')
      .eq('agent_code', body.agent_code)
      .eq('role', 'agent')
      .eq('is_verified_agent', true)
      .single()
    agentId = agent?.id ?? null
  }

  const amenities = typeof body.amenities === 'string'
    ? body.amenities.split(',').map((a: string) => a.trim()).filter(Boolean)
    : (body.amenities as string[] | undefined) ?? []

  const rooms = typeof body.rooms === 'string' ? JSON.parse(body.rooms as string) : (body.rooms ?? [])

  // Calculate starting price from rooms
  const startingPrice = rooms.length > 0
    ? Math.min(...(rooms as Array<{ price: number }>).map((r) => r.price))
    : 0

  const { data: property, error } = await supabase
    .from('properties')
    .insert({
      owner_id: user.id,
      referred_by: referredBy,
      agent_id: agentId,
      name: body.name,
      tagline: body.tagline,
      address: body.address,
      city: body.city,
      state: body.state,
      landmark: body.landmark,
      lat: body.lat,
      lng: body.lng,
      gender: body.gender ?? 'Co-ed',
      amenities,
      starting_price: startingPrice,
      manager_name: body.manager_name,
      manager_phone: body.manager_phone,
      commission_option: body.commission_option ?? 'recurring',
    })
    .select()
    .single()

  if (error || !property) return c.json({ success: false, message: error?.message ?? 'Failed to create property' }, 500)

  // Insert rooms, then provision one bed row per total_beds — the sync
  // trigger derives property_rooms/properties total_beds & available_beds
  // from these rows, so no manual counter math is needed here.
  if (rooms.length > 0) {
    const { data: insertedRooms, error: roomsError } = await supabase
      .from('property_rooms')
      .insert((rooms as Array<Record<string, unknown>>).map((r) => ({ ...r, property_id: property.id })))
      .select('id, total_beds')

    if (roomsError) return c.json({ success: false, message: roomsError.message }, 500)

    const bedInserts = (insertedRooms ?? []).flatMap((room: { id: string; total_beds: number }) =>
      Array.from({ length: Math.max(room.total_beds ?? 0, 0) }, (_, i) => ({
        room_id: room.id,
        property_id: property.id,
        label: `Bed ${i + 1}`,
      }))
    )
    if (bedInserts.length > 0) await supabase.from('beds').insert(bedInserts)
  }

  // Upload images to R2
  if (imageFiles.length > 0) {
    const imageInserts = []
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const ext = file.name.split('.').pop() ?? 'jpg'
      const key = `properties/${property.id}/${crypto.randomUUID()}.${ext}`
      await uploadToR2(c.env.R2, key, await file.arrayBuffer(), file.type)
      imageInserts.push({ property_id: property.id, image_key: key, position: i })
    }
    await supabase.from('property_images').insert(imageInserts)
  }

  return c.json({ success: true, message: 'Property submitted for review', property }, 201)
})

// PATCH /api/properties/:id — owner updates own listing
propertiesRouter.patch('/:id', authMiddleware, async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)
  const propertyId = c.req.param('id')

  const { data: existing } = await supabase.from('properties').select('*').eq('id', propertyId).single()
  if (!existing) return c.json({ success: false, message: 'Property not found' }, 404)
  if (existing.owner_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not authorized' }, 403)
  }

  const body = await c.req.json()
  const allowed = ['name', 'tagline', 'address', 'city', 'state', 'landmark', 'lat', 'lng', 'gender', 'amenities', 'manager_name', 'manager_phone']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  if (existing.status === 'verified') {
    updates.status = 'pending'
    updates.is_verified = false
  }

  const { data, error } = await supabase.from('properties').update(updates).eq('id', propertyId).select().single()
  if (error) return c.json({ success: false, message: error.message }, 500)

  if (body.rooms) {
    const incomingRooms: Array<Record<string, unknown>> = Array.isArray(body.rooms) ? body.rooms : JSON.parse(body.rooms)

    // Real bed rows are now linked to bookings — a blind delete-all-and-reinsert
    // would CASCADE-delete beds out from under active tenancies. Diff instead.
    const { data: existingRooms } = await supabase
      .from('property_rooms')
      .select('id, type, price, description, total_beds, beds(id, label, status)')
      .eq('property_id', propertyId)

    type ExistingRoom = { id: string; type: string; price: number; description: string | null; total_beds: number; beds: { id: string; label: string; status: string }[] }
    const existingById = new Map<string, ExistingRoom>(((existingRooms ?? []) as ExistingRoom[]).map((r) => [r.id, r]))
    const keptIds = new Set(incomingRooms.map((r) => r.id as string | undefined).filter(Boolean) as string[])

    // Rooms omitted from the payload — only safe to drop if every bed on them is vacant.
    for (const room of existingRooms ?? []) {
      const r = room as ExistingRoom
      if (keptIds.has(r.id)) continue
      const hasClaimedBed = r.beds.some((b) => b.status === 'occupied' || b.status === 'locked')
      if (hasClaimedBed) {
        return c.json({ success: false, message: `Cannot remove a room type with an occupied or reserved bed (${r.type}).` }, 409)
      }
      await supabase.from('property_rooms').delete().eq('id', r.id)
    }

    for (const r of incomingRooms) {
      const roomId = r.id as string | undefined
      const targetBeds = Math.max(Number(r.total_beds) || 0, 0)

      if (roomId && existingById.has(roomId)) {
        const current = existingById.get(roomId)!
        await supabase.from('property_rooms').update({
          type: r.type, price: r.price, description: r.description,
        }).eq('id', roomId)

        const currentBeds = current.beds
        const diff = targetBeds - currentBeds.length
        if (diff > 0) {
          const existingLabels = new Set(currentBeds.map((b) => b.label))
          let n = 1
          const newBeds = []
          while (newBeds.length < diff) {
            const label = `Bed ${n}`
            if (!existingLabels.has(label)) newBeds.push({ room_id: roomId, property_id: propertyId, label })
            n += 1
          }
          await supabase.from('beds').insert(newBeds)
        } else if (diff < 0) {
          const vacant = currentBeds.filter((b) => b.status === 'vacant')
          if (vacant.length < -diff) {
            return c.json({ success: false, message: `Cannot reduce beds below the number currently reserved or occupied (${r.type}).` }, 409)
          }
          const toRemove = vacant.slice(0, -diff).map((b) => b.id)
          await supabase.from('beds').delete().in('id', toRemove)
        }
      } else {
        const { data: newRoom, error: newRoomError } = await supabase
          .from('property_rooms')
          .insert({ type: r.type, price: r.price, description: r.description, total_beds: targetBeds, available_beds: targetBeds, property_id: propertyId })
          .select('id')
          .single()
        if (newRoomError || !newRoom) return c.json({ success: false, message: newRoomError?.message ?? 'Failed to add room' }, 500)

        const newBeds = Array.from({ length: targetBeds }, (_, i) => ({ room_id: newRoom.id, property_id: propertyId, label: `Bed ${i + 1}` }))
        if (newBeds.length > 0) await supabase.from('beds').insert(newBeds)
      }
    }

    const startingPrice = Math.min(...incomingRooms.map((r) => Number(r.price)))
    await supabase.from('properties').update({ starting_price: startingPrice }).eq('id', propertyId)
    // total_beds/available_beds are no longer written here — the sync trigger
    // on `beds` derives both from the room/bed changes made above.
  }

  return c.json({ success: true, property: data })
})

// DELETE /api/properties/:id
propertiesRouter.delete('/:id', authMiddleware, async (c) => {
  const user = c.get('user')
  const supabase = getSupabase(c.env)
  const propertyId = c.req.param('id')

  const { data: property } = await supabase.from('properties').select('owner_id').eq('id', propertyId).single()
  if (!property) return c.json({ success: false, message: 'Property not found' }, 404)
  if (property.owner_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not authorized' }, 403)
  }

  const { data: images } = await supabase.from('property_images').select('image_key').eq('property_id', propertyId)
  if (images?.length) await deleteFromR2(c.env.R2, images.map((img: { image_key: string }) => img.image_key))

  await supabase.from('properties').delete().eq('id', propertyId)
  return c.json({ success: true, message: 'Property deleted' })
})
