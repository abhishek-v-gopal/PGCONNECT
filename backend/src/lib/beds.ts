import { getSupabase } from './supabase'

type Supabase = ReturnType<typeof getSupabase>

export type Bed = {
  id: string
  room_id: string
  property_id: string
  label: string
  status: 'vacant' | 'locked' | 'occupied' | 'notice-period'
  locked_at: string | null
  locked_until: string | null
  locked_by: string | null
  current_booking_id: string | null
}

// How long a bed stays held once an owner confirms a booking request —
// long enough for the tenant to come back and pay without an impatient owner
// approval turning into an instant hold.
export const CONFIRM_HOLD_MINUTES = 2880 // 48h

// How long a bed stays held during an actual Razorpay checkout attempt.
export const PAYMENT_LOCK_MINUTES = 20

// Atomically claims one vacant (or lock-expired) bed within a room-type
// bucket. Returns null if none are available.
export const claimBedForRoom = async (
  supabase: Supabase,
  roomId: string,
  lockedBy: string,
  bookingId: string,
  ttlMinutes = CONFIRM_HOLD_MINUTES
): Promise<Bed | null> => {
  const { data, error } = await supabase.rpc('claim_bed_for_room', {
    p_room_id: roomId,
    p_locked_by: lockedBy,
    p_booking_id: bookingId,
    p_ttl_minutes: ttlMinutes,
  })
  if (error) throw new Error(error.message)
  return (data as Bed) ?? null
}

// Re-locks a bed already assigned to this booking, extending its hold —
// used right before the Razorpay checkout opens.
export const reclaimOrExtendBed = async (
  supabase: Supabase,
  bedId: string,
  lockedBy: string,
  bookingId: string,
  ttlMinutes = PAYMENT_LOCK_MINUTES
): Promise<Bed | null> => {
  const { data, error } = await supabase.rpc('reclaim_or_extend_bed', {
    p_bed_id: bedId,
    p_locked_by: lockedBy,
    p_booking_id: bookingId,
    p_ttl_minutes: ttlMinutes,
  })
  if (error) throw new Error(error.message)
  return (data as Bed) ?? null
}

// locked/vacant -> occupied. Safe to call more than once for the same booking.
export const occupyBed = async (
  supabase: Supabase,
  bedId: string,
  bookingId: string
): Promise<Bed | null> => {
  const { data, error } = await supabase.rpc('occupy_bed', {
    p_bed_id: bedId,
    p_booking_id: bookingId,
  })
  if (error) throw new Error(error.message)
  return (data as Bed) ?? null
}

// locked -> vacant. Never touches an occupied bed.
export const releaseBed = async (
  supabase: Supabase,
  bedId: string,
  bookingId?: string
): Promise<Bed | null> => {
  const { data, error } = await supabase.rpc('release_bed', {
    p_bed_id: bedId,
    p_booking_id: bookingId ?? null,
  })
  if (error) throw new Error(error.message)
  return (data as Bed) ?? null
}
