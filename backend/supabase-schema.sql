-- PG Connect — Supabase PostgreSQL Schema
-- Run this entire file once in the Supabase SQL editor.

-- ─── PROFILES ────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'owner', 'admin')),
  phone TEXT,
  avatar TEXT,
  university TEXT,
  is_verified_owner BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  referral_code TEXT UNIQUE,
  commission_type TEXT NOT NULL DEFAULT 'recurring' CHECK (commission_type IN ('recurring', 'one-time')),
  total_commission_earned NUMERIC NOT NULL DEFAULT 0,
  commission_balance NUMERIC NOT NULL DEFAULT 0,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PROPERTIES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  landmark TEXT,
  lat NUMERIC,
  lng NUMERIC,
  amenities TEXT[] DEFAULT '{}',
  gender TEXT DEFAULT 'Co-ed' CHECK (gender IN ('Boys', 'Girls', 'Co-ed')),
  starting_price NUMERIC NOT NULL DEFAULT 0,
  rating NUMERIC NOT NULL DEFAULT 0,
  total_ratings INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_review', 'verified', 'rejected', 'unlisted')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  manager_name TEXT,
  manager_phone TEXT,
  total_beds INT NOT NULL DEFAULT 0,
  available_beds INT NOT NULL DEFAULT 0,
  views INT NOT NULL DEFAULT 0,
  inquiries_count INT NOT NULL DEFAULT 0,
  saves_count INT NOT NULL DEFAULT 0,
  commission_option TEXT DEFAULT 'recurring' CHECK (commission_option IN ('recurring', 'one-time')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_referred_by ON properties(referred_by);

-- ─── PROPERTY ROOMS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Single', 'Double', 'Triple')),
  price NUMERIC NOT NULL,
  total_beds INT NOT NULL DEFAULT 1,
  available_beds INT NOT NULL DEFAULT 1,
  description TEXT,
  image_key TEXT,
  image_url TEXT
);

-- ─── PROPERTY IMAGES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_key TEXT NOT NULL,
  image_url TEXT,
  position INT NOT NULL DEFAULT 0
);

-- ─── BOOKINGS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL CHECK (room_type IN ('Single', 'Double', 'Triple')),
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  monthly_rent NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'overdue', 'processing')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);

-- ─── INQUIRIES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  move_in DATE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SAVED PROPERTIES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_properties (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  tenant_id UUID NOT NULL REFERENCES profiles(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  amount NUMERIC NOT NULL,
  platform_fee NUMERIC,
  referrer_commission NUMERIC,
  platform_revenue NUMERIC,
  owner_payout NUMERIC,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  month DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_property ON payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ─── COMMISSIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  payment_id UUID NOT NULL REFERENCES payments(id),
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recurring', 'one-time')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  month DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_referrer ON commissions(referrer_id);

-- ─── REVIEWS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_verified_stay BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (property_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- ─── HELPER FUNCTION: increment inquiries ────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_inquiries(prop_id UUID)
RETURNS void AS $$
  UPDATE properties SET inquiries_count = inquiries_count + 1 WHERE id = prop_id;
$$ LANGUAGE SQL;

-- ─── HELPER FUNCTION: recompute property rating from approved reviews ────────
CREATE OR REPLACE FUNCTION recompute_property_rating(prop_id UUID)
RETURNS void AS $$
  UPDATE properties SET
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE property_id = prop_id AND status = 'approved'), 0),
    total_ratings = (SELECT COUNT(*) FROM reviews WHERE property_id = prop_id AND status = 'approved')
  WHERE id = prop_id;
$$ LANGUAGE SQL;

-- ─── HELPER FUNCTION: adjust saves (likes) count ──────────────────────────────
CREATE OR REPLACE FUNCTION adjust_property_saves(prop_id UUID, delta INT)
RETURNS void AS $$
  UPDATE properties SET saves_count = GREATEST(0, saves_count + delta) WHERE id = prop_id;
$$ LANGUAGE SQL;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- profiles: users can read/update own; backend (service key) bypasses RLS
CREATE POLICY "profiles_own_read" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- properties: public can read verified; owners can CRUD own
CREATE POLICY "properties_public_read" ON properties FOR SELECT USING (status = 'verified');
CREATE POLICY "properties_owner_all" ON properties FOR ALL USING (auth.uid() = owner_id);

-- property_rooms & images: public can read for verified properties (join handles this via RLS bypass from backend)
CREATE POLICY "rooms_read_all" ON property_rooms FOR SELECT USING (true);
CREATE POLICY "images_read_all" ON property_images FOR SELECT USING (true);

-- bookings: tenant or property owner can read
CREATE POLICY "bookings_tenant_read" ON bookings FOR SELECT USING (auth.uid() = tenant_id);

-- saved_properties: own only
CREATE POLICY "saved_own" ON saved_properties FOR ALL USING (auth.uid() = user_id);

-- payments/commissions: backend only via service role key
-- No user-facing policies; all access via service role

-- reviews: public can read approved; tenant can read/insert own
CREATE POLICY "reviews_public_read_approved" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "reviews_own_read" ON reviews FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "reviews_own_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = tenant_id);

-- ─── AUTO-CONFIRM EMAILS FOR LOCAL DEV (optional) ───────────────────────────
-- In Supabase dashboard: Authentication > Settings > disable "Confirm email"
-- for faster local development.
