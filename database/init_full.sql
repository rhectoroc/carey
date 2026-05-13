-- ============================================================
-- CAREY TOUR — SCRIPT DE INICIALIZACIÓN COMPLETA
-- Versión: 2026-05-13
-- Uso: Ejecutar completo en DbGate sobre la base de datos 'carey'
-- Orden: Schema → Índices → Seed Data → Usuario Admin
-- ============================================================


-- ============================================================
-- SECCIÓN 1: SCHEMA (TABLAS)
-- ============================================================

-- 1. Tabla de Usuarios (Autenticación)
CREATE TABLE IF NOT EXISTS auth_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,           -- 'administrador', 'empleado', 'freelance'
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Sesiones Administrativas
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

-- 3. Tabla de Destinos
CREATE TABLE IF NOT EXISTS destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    country VARCHAR(100) DEFAULT 'Venezuela',
    image_url TEXT,
    type VARCHAR(50) NOT NULL,           -- 'Ciudad', 'Isla', 'Parque Nacional', etc.
    is_featured BOOLEAN DEFAULT FALSE,
    is_promotion BOOLEAN DEFAULT FALSE,
    gallery JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    created_by INTEGER REFERENCES auth_user(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Hoteles
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
    pricing_matrix JSONB DEFAULT '[]',
    room_types JSONB DEFAULT '[]',
    occupancies JSONB DEFAULT '[]',
    plan_types JSONB DEFAULT '[]',
    show_price_publicly BOOLEAN DEFAULT TRUE,
    price_valid_until DATE,
    rating NUMERIC(3, 1) DEFAULT 5.0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_promotion BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) DEFAULT 'Hotel',
    created_by INTEGER REFERENCES auth_user(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Tours
CREATE TABLE IF NOT EXISTS tours (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    destination_id INTEGER REFERENCES destinations(id),
    type VARCHAR(100),                   -- 'Aventura', 'Navegación', 'Playa', 'Montaña', 'Cultural', 'Ecoturismo'
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

-- 6. Tabla de Traslados
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

-- 7. Tabla de Vuelos (GDS Externo / Mock)
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

-- 8. Tabla de Momentos Inolvidables
CREATE TABLE IF NOT EXISTS unforgettable_moments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    creator_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES auth_user(id)
);

-- 9. Tabla de Clientes (CRM Básico)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(50) UNIQUE NOT NULL, -- Cédula o Pasaporte
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabla de Cotizaciones
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(50),
    hotel_id INTEGER REFERENCES hotels(id),
    check_in DATE,
    check_out DATE,
    adults INTEGER DEFAULT 1,
    children_4_10 INTEGER DEFAULT 0,
    children_0_3 INTEGER DEFAULT 0,
    extra_services JSONB DEFAULT '[]',
    total_price NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'en_revision', 'aprobada', 'rechazada'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- SECCIÓN 2: ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_sessions_token      ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id    ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_hotels_destination  ON hotels(destination_id);
CREATE INDEX IF NOT EXISTS idx_tours_destination   ON tours(destination_id);
CREATE INDEX IF NOT EXISTS idx_transfers_destination ON transfers(destination_id);
CREATE INDEX IF NOT EXISTS idx_hotels_tags         ON hotels USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_tours_tags          ON tours USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_customers_doc       ON customers(document_id);


-- ============================================================
-- SECCIÓN 3: DATOS SEMILLA (SEED DATA)
-- ============================================================

-- Destinos
INSERT INTO destinations (name, slug, type, country, description) VALUES
('Isla de Margarita', 'isla-margarita',  'Isla',            'Venezuela', 'La Perla del Caribe, playas y compras.'),
('Los Roques',        'los-roques',      'Parque Nacional', 'Venezuela', 'Archipiélago paradisíaco de aguas cristalinas.'),
('Canaima',           'canaima',         'Parque Nacional', 'Venezuela', 'Hogar del Salto Ángel, la caída de agua más alta del mundo.'),
('Caracas',           'caracas',         'Ciudad',          'Venezuela', 'La capital, centro cultural y de negocios.'),
('Mérida',            'merida',          'Ciudad',          'Venezuela', 'Los Andes venezolanos, teleférico y montañas.')
ON CONFLICT (slug) DO NOTHING;

-- Hoteles
INSERT INTO hotels (name, slug, destination_id, stars, price, rating, type) VALUES
('Wyndham Concorde',       'wyndham-concorde',       (SELECT id FROM destinations WHERE slug='isla-margarita'), 5, 120.00, 4.8, 'Hotel'),
('Hesperia Isla Margarita','hesperia-isla-margarita', (SELECT id FROM destinations WHERE slug='isla-margarita'), 5, 110.00, 4.5, 'Hotel'),
('Posada Galápagos',       'posada-galapagos',       (SELECT id FROM destinations WHERE slug='los-roques'),     4, 350.00, 4.9, 'Posada'),
('Waku Lodge',             'waku-lodge',             (SELECT id FROM destinations WHERE slug='canaima'),        5, 450.00, 5.0, 'Campamento'),
('Hotel Humboldt',         'hotel-humboldt',         (SELECT id FROM destinations WHERE slug='caracas'),        5, 200.00, 4.7, 'Hotel')
ON CONFLICT (slug) DO NOTHING;

-- Tours
INSERT INTO tours (name, slug, destination_id, type, duration, price, stars) VALUES
('Full Day Isla de Coche',  'full-day-coche',          (SELECT id FROM destinations WHERE slug='isla-margarita'), 'Playa',       '8 horas', 45.00,  5),
('Jeep Safari 4x4',         'jeep-safari-margarita',   (SELECT id FROM destinations WHERE slug='isla-margarita'), 'Aventura',    '6 horas', 60.00,  4),
('Expedición Salto Ángel',  'expedicion-salto-angel',  (SELECT id FROM destinations WHERE slug='canaima'),        'Aventura',    '3 días',  500.00, 5),
('Catamarán a Noronky',     'catamaran-noronky',       (SELECT id FROM destinations WHERE slug='los-roques'),     'Navegación',  '7 horas', 90.00,  5)
ON CONFLICT (slug) DO NOTHING;

-- Vuelos (Rutas Frecuentes Mock)
INSERT INTO flights (airline, from_code, to_code, price, class) VALUES
('Conviasa', 'CCS', 'PMV', 50.00,  'Economy'),
('Laser',    'CCS', 'PMV', 60.00,  'Economy'),
('Conviasa', 'CCS', 'LRV', 120.00, 'Economy'),
('Rutaca',   'CCS', 'LSP', 80.00,  'Economy');

-- Momentos Inolvidables
INSERT INTO unforgettable_moments (title, location, description, video_url, thumbnail_url) VALUES
('Life''s Beach Tours',    'Jeep Safari',          'Full Day Jeep Safari Tour Naturaleza 4x4',                                                       '/videos/lifebeach.mp4', 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1920&auto=format&fit=crop'),
('Atardecer en Macanao',   'Peninsula de Macanao', 'Siente la inmensidad del desierto y la calidez de un atardecer inolvidable.',                    '/videos/macanao.mp4',   'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1920&auto=format&fit=crop'),
('Aventura en Cubagua',    'Isla de Cubagua',      'Disfruta de la belleza natural de la isla de Cubagua.',                                           '/videos/cubagua.mp4',   'https://images.unsplash.com/photo-1589785834890-48e02d4f3b25?q=80&w=1920&auto=format&fit=crop');


-- ============================================================
-- SECCIÓN 4: USUARIO ADMINISTRADOR INICIAL
-- CONTRASEÑA: admin1234  (hash bcrypt con 10 rounds)
-- ⚠️  CAMBIA LA CONTRASEÑA DESDE EL PANEL DESPUÉS DEL PRIMER LOGIN
-- ============================================================

INSERT INTO auth_user (username, password_hash, role, first_name, last_name, email)
VALUES (
    'admin',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',  -- admin1234
    'administrador',
    'Admin',
    'Carey',
    'admin@careytour.com'
)
ON CONFLICT (username) DO NOTHING;


-- ============================================================
-- FIN DEL SCRIPT
-- Verifica las tablas creadas con:
--   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- ============================================================
