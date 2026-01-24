
-- Step 1: Add price_child and price_infant columns to the tours table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'price_child') THEN
        ALTER TABLE tours ADD COLUMN price_child DECIMAL(10, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'price_infant') THEN
        ALTER TABLE tours ADD COLUMN price_infant DECIMAL(10, 2) DEFAULT 0;
    END IF;
END $$;
