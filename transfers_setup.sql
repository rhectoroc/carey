-- Add type column to hotels
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS type VARCHAR(50);
-- Normalize existing hotels to 'Hotel' if null
UPDATE hotels SET type = 'Hotel' WHERE type IS NULL;

-- Ensure description exists in tours
ALTER TABLE tours ADD COLUMN IF NOT EXISTS description TEXT;

-- Create transfers table
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('terrestre', 'aereo', 'maritimo')),
    description TEXT,
    price DECIMAL(10, 2),
    capacity INTEGER,
    image_url TEXT,
    destination_id INTEGER REFERENCES destinations(id),
    is_featured BOOLEAN DEFAULT false,
    is_promotion BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES auth_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_transfers_destination ON transfers(destination_id);
