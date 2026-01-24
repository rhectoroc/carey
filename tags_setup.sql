-- Add tags column to hotels, tours, transfers
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Index for tags if needed (gin index for jsonb)
CREATE INDEX IF NOT EXISTS idx_hotels_tags ON hotels USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_tours_tags ON tours USING GIN (tags);
