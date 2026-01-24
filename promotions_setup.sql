-- Add is_promotion column to destinations table
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN DEFAULT FALSE;

-- Add is_promotion column to hotels table
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN DEFAULT FALSE;

-- Add is_promotion column to tours table
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN DEFAULT FALSE;
