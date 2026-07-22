-- Run in Supabase Dashboard → SQL Editor.
-- Adds the `state` column that property filtering by state/place relies on.
-- Existing rows get a placeholder so the NOT NULL constraint can be applied
-- without failing on current data — update them with real values afterward.

ALTER TABLE properties ADD COLUMN IF NOT EXISTS state TEXT;

UPDATE properties SET state = 'Unknown' WHERE state IS NULL;

ALTER TABLE properties ALTER COLUMN state SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
