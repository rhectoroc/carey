-- Carey Database Schema
-- Last updated: 2026-01-24

-- 1. Authentication Table
CREATE TABLE IF NOT EXISTS auth_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'administrador', 'freelance', 'empleado'
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessions Table (for security and inactivity)
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    user_agent TEXT,
    ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON admin_sessions(user_id);

-- 3. Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    country VARCHAR(100) DEFAULT 'Venezuela',
    image_url TEXT,
    type VARCHAR(50) NOT NULL, -- 'Ciudad', 'Isla', 'Parque Nacional', etc.
    is_featured BOOLEAN DEFAULT FALSE,
    is_promotion BOOLEAN DEFAULT FALSE,
    gallery JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    created_by INTEGER REFERENCES auth_user(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    destination_id INTEGER REFERENCES destinations(id),
    stars INTEGER,
    price NUMERIC(10, 2),
    price_child NUMERIC(10, 2),
    price_infant NUMERIC(10, 2),
    image_url TEXT,
    features JSONB DEFAULT '[]',
    gallery JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    rating NUMERIC(3, 1) DEFAULT 5.0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_promotion BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) DEFAULT 'Hotel',
    created_by INTEGER REFERENCES auth_user(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tours Table
CREATE TABLE IF NOT EXISTS tours (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    destination_id INTEGER REFERENCES destinations(id),
    type VARCHAR(100), -- 'Aventura', 'Navegación', 'Playa', 'Montaña', 'Cultural', 'Ecoturismo'
    duration VARCHAR(100),
    price NUMERIC(10, 2),
    price_child NUMERIC(10, 2) DEFAULT 0,
    price_infant NUMERIC(10, 2) DEFAULT 0,
    price_valid_until DATE,
    image_url TEXT,
    included JSONB DEFAULT '[]',
    gallery JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT FALSE,
    is_promotion BOOLEAN DEFAULT FALSE,
    stars INTEGER DEFAULT 5,
    created_by INTEGER REFERENCES auth_user(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Transfers Table
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('terrestre', 'aereo', 'maritimo')),
    description TEXT,
    price NUMERIC(10, 2),
    capacity INTEGER,
    image_url TEXT,
    destination_id INTEGER REFERENCES destinations(id),
    is_featured BOOLEAN DEFAULT FALSE,
    is_promotion BOOLEAN DEFAULT FALSE,
    gallery JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    created_by INTEGER REFERENCES auth_user(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Flights Table (Optional/External GDS logic)
CREATE TABLE IF NOT EXISTS flights (
    id SERIAL PRIMARY KEY,
    airline VARCHAR(100),
    flight_number VARCHAR(20),
    from_code VARCHAR(10),
    to_code VARCHAR(10),
    departure_time TIMESTAMP WITHOUT TIME ZONE,
    arrival_time TIMESTAMP WITHOUT TIME ZONE,
    price NUMERIC(10, 2),
    class VARCHAR(50)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hotels_destination ON hotels(destination_id);
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination_id);
CREATE INDEX IF NOT EXISTS idx_transfers_destination ON transfers(destination_id);
CREATE INDEX IF NOT EXISTS idx_hotels_tags ON hotels USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_tours_tags ON tours USING GIN (tags);
