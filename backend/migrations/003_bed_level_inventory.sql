-- Run in Supabase Dashboard → SQL Editor.
-- Adds real per-bed inventory. Today `property_rooms.total_beds`/`available_beds`
-- are plain integers that the booking flow never touches — nothing actually
-- prevents two tenants being confirmed into the same "available" room type.
-- This migration gives every bed its own row and its own state
-- (vacant/locked/occupied/notice-period), plus the RPCs the backend uses to
-- atomically claim one.

-- ── 1. Schema ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES property_rooms(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Bed 1',
  status TEXT NOT NULL DEFAULT 'vacant'
    CHECK (status IN ('vacant', 'locked', 'occupied', 'notice-period')),
  locked_at TIMESTAMPTZ,
  locked_until TIMESTAMPTZ,
  locked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  current_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_id, label)
);

CREATE INDEX IF NOT EXISTS idx_beds_room ON beds(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_property_status ON beds(property_id, status);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES beds(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_bed ON bookings(bed_id);

ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "beds_read_all" ON beds;
CREATE POLICY "beds_read_all" ON beds FOR SELECT USING (true);

-- ── 2. Sync trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_bed_availability_counts() RETURNS TRIGGER AS $$
DECLARE
  r_id UUID := COALESCE(NEW.room_id, OLD.room_id);
  p_id UUID := COALESCE(NEW.property_id, OLD.property_id);
BEGIN
  UPDATE property_rooms SET
    total_beds = (SELECT COUNT(*) FROM beds WHERE room_id = r_id),
    available_beds = (SELECT COUNT(*) FROM beds WHERE room_id = r_id AND status = 'vacant')
  WHERE id = r_id;

  UPDATE properties SET
    total_beds = (SELECT COUNT(*) FROM beds WHERE property_id = p_id),
    available_beds = (SELECT COUNT(*) FROM beds WHERE property_id = p_id AND status = 'vacant')
  WHERE id = p_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_bed_availability ON beds;
CREATE TRIGGER trg_sync_bed_availability
AFTER INSERT OR UPDATE OF status OR DELETE ON beds
FOR EACH ROW EXECUTE FUNCTION sync_bed_availability_counts();

-- ── 3. Locking RPCs ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION claim_bed_for_room(
  p_room_id UUID, p_locked_by UUID, p_booking_id UUID, p_ttl_minutes INT DEFAULT 2880
) RETURNS beds AS $$
DECLARE claimed beds;
BEGIN
  UPDATE beds SET
    status = 'locked', locked_by = p_locked_by, locked_at = now(),
    locked_until = now() + (p_ttl_minutes || ' minutes')::interval,
    current_booking_id = p_booking_id, updated_at = now()
  WHERE id = (
    SELECT id FROM beds
    WHERE room_id = p_room_id
      AND (status = 'vacant' OR (status = 'locked' AND locked_until < now()))
    ORDER BY status ASC, locked_until ASC NULLS FIRST, label ASC
    FOR UPDATE SKIP LOCKED LIMIT 1
  )
  RETURNING * INTO claimed;
  RETURN claimed;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reclaim_or_extend_bed(
  p_bed_id UUID, p_locked_by UUID, p_booking_id UUID, p_ttl_minutes INT DEFAULT 20
) RETURNS beds AS $$
DECLARE claimed beds;
BEGIN
  UPDATE beds SET
    status = 'locked', locked_by = p_locked_by, locked_at = now(),
    locked_until = now() + (p_ttl_minutes || ' minutes')::interval,
    current_booking_id = p_booking_id, updated_at = now()
  WHERE id = p_bed_id
    AND (status = 'vacant'
      OR (status = 'locked' AND (locked_until < now() OR locked_by = p_locked_by)))
  RETURNING * INTO claimed;
  RETURN claimed;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION occupy_bed(p_bed_id UUID, p_booking_id UUID) RETURNS beds AS $$
DECLARE occ beds;
BEGIN
  UPDATE beds SET
    status = 'occupied', locked_by = NULL, locked_at = NULL, locked_until = NULL,
    current_booking_id = p_booking_id, updated_at = now()
  WHERE id = p_bed_id
    AND (status IN ('locked', 'vacant') OR (status = 'occupied' AND current_booking_id = p_booking_id))
  RETURNING * INTO occ;
  RETURN occ;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION release_bed(p_bed_id UUID, p_booking_id UUID DEFAULT NULL) RETURNS beds AS $$
DECLARE released beds;
BEGIN
  UPDATE beds SET
    status = 'vacant', locked_by = NULL, locked_at = NULL, locked_until = NULL, current_booking_id = NULL, updated_at = now()
  WHERE id = p_bed_id AND status = 'locked'
    AND (p_booking_id IS NULL OR current_booking_id = p_booking_id)
  RETURNING * INTO released;
  RETURN released;
END;
$$ LANGUAGE plpgsql;

-- ── 4. Backfill: provision bed rows for existing rooms ───────────────────

INSERT INTO beds (room_id, property_id, label, status)
SELECT pr.id, pr.property_id, 'Bed ' || gs.n, 'vacant'
FROM property_rooms pr
CROSS JOIN LATERAL generate_series(1, GREATEST(pr.total_beds, 1)) AS gs(n)
ON CONFLICT (room_id, label) DO NOTHING;

-- ── 5. Backfill: best-effort pair existing confirmed/active bookings to beds ─
-- There's no ground-truth link between an old booking and a literal bed — this
-- is a stable but arbitrary pairing (by creation order) used only to seed sane
-- initial state, not a claim of physical accuracy. Backfilled unpaid
-- 'confirmed' bookings get a long 30-day hold instead of the normal 48h, so
-- this migration doesn't itself release real outstanding holds within hours
-- of deploy — review against real data before running in production.

WITH ranked_bookings AS (
  SELECT id AS booking_id, property_id, room_type, status,
         ROW_NUMBER() OVER (PARTITION BY property_id, room_type ORDER BY created_at) AS rn
  FROM bookings WHERE status IN ('confirmed', 'active') AND bed_id IS NULL
), ranked_beds AS (
  SELECT bd.id AS bed_id, pr.property_id, pr.type AS room_type,
         ROW_NUMBER() OVER (PARTITION BY pr.property_id, pr.type ORDER BY bd.label) AS rn
  FROM beds bd JOIN property_rooms pr ON pr.id = bd.room_id
  WHERE bd.status = 'vacant'
)
UPDATE beds SET
  status = CASE WHEN rk.status = 'active' THEN 'occupied' ELSE 'locked' END,
  current_booking_id = rk.booking_id,
  locked_until = CASE WHEN rk.status = 'confirmed' THEN now() + interval '30 days' ELSE NULL END,
  updated_at = now()
FROM ranked_beds rb JOIN ranked_bookings rk
  ON rk.property_id = rb.property_id AND rk.room_type = rb.room_type AND rk.rn = rb.rn
WHERE beds.id = rb.bed_id;

UPDATE bookings SET bed_id = beds.id
FROM beds WHERE beds.current_booking_id = bookings.id AND bookings.bed_id IS NULL;

-- ── 6. Surface pre-existing overbooking for manual review ────────────────
-- Any rows here mean more confirmed/active bookings existed for a room type
-- than it had beds for — real overbooking this migration cannot silently fix.
-- Resolve manually (add a bed, or contact the tenant) before relying on the
-- new claim flow to be the single source of truth.

SELECT id, property_id, room_type, status, tenant_id, monthly_rent, created_at
FROM bookings WHERE status IN ('confirmed', 'active') AND bed_id IS NULL;

-- ── 7. One-time recompute (trigger only fires on future changes) ─────────

UPDATE property_rooms SET
  total_beds = (SELECT COUNT(*) FROM beds WHERE room_id = property_rooms.id),
  available_beds = (SELECT COUNT(*) FROM beds WHERE room_id = property_rooms.id AND status = 'vacant');

UPDATE properties SET
  total_beds = (SELECT COUNT(*) FROM beds WHERE property_id = properties.id),
  available_beds = (SELECT COUNT(*) FROM beds WHERE property_id = properties.id AND status = 'vacant');
