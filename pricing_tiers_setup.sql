-- Add pricing tiers to hotels
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS price_child DECIMAL(10, 2);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS price_infant DECIMAL(10, 2);

-- Add pricing tiers to tours
ALTER TABLE tours ADD COLUMN IF NOT EXISTS price_child DECIMAL(10, 2);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS price_infant DECIMAL(10, 2);
