-- Add gallery to destinations and transfers
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]';
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]';
