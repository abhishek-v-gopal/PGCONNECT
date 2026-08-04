-- Run in Supabase Dashboard → SQL Editor.
-- Adds the Agent role: owners connect to an agent via an agent_code (entered
-- while listing a property), agents earn a one-time bounty when that property
-- gets verified plus an ongoing recurring cut of its booking commission.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'owner', 'agent', 'admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified_agent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_code TEXT UNIQUE;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS agent_bounty_paid BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS agent_commission NUMERIC;

ALTER TABLE commissions ALTER COLUMN payment_id DROP NOT NULL;
ALTER TABLE commissions DROP CONSTRAINT IF EXISTS commissions_type_check;
ALTER TABLE commissions ADD CONSTRAINT commissions_type_check CHECK (type IN ('recurring', 'one-time', 'bounty'));
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'referrer' CHECK (role IN ('referrer', 'agent'));
