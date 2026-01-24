-- Add gallery to hotels and tours
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]';
