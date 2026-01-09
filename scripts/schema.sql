-- Database Definition
-- Ejecutar estas líneas si aún no existe la base de datos
-- CREATE DATABASE careytour;

-- Conectarse a la base de datos 'careytour' antes de ejecutar lo siguiente

-- 1. Tabla de Destinos
CREATE TABLE IF NOT EXISTS destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'city', 'airport', 'island', 'park'
    country VARCHAR(100) DEFAULT 'Venezuela',
    description TEXT,
    image_url TEXT
);

-- 2. Tabla de Hoteles
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    destination_id INTEGER REFERENCES destinations(id),
    stars INTEGER,
    price_per_night DECIMAL(10,2),
    description TEXT,
    image_url TEXT,
    rating DECIMAL(3,1)
);

-- 3. Tabla de Tours / Experiencias
CREATE TABLE IF NOT EXISTS tours (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    destination_id INTEGER REFERENCES destinations(id),
    type VARCHAR(100), -- 'Playa', 'Aventura', 'Montaña', etc.
    duration_days INTEGER,
    price DECIMAL(10,2),
    description TEXT,
    image_url TEXT
);

-- 4. Tabla de Vuelos (Simulada para GDS)
CREATE TABLE IF NOT EXISTS flights (
    id SERIAL PRIMARY KEY,
    airline VARCHAR(100),
    flight_number VARCHAR(20),
    from_code VARCHAR(10), -- Código IATA (CCS, PMV)
    to_code VARCHAR(10),
    departure_time TIMESTAMP,
    arrival_time TIMESTAMP,
    price DECIMAL(10,2),
    class VARCHAR(50) -- 'Economy', 'Business', 'First'
);

-- SEED DATA (Datos de Prueba)

-- Destinos
INSERT INTO destinations (name, type, country, description) VALUES 
('Isla de Margarita', 'island', 'Venezuela', 'La Perla del Caribe, playas y compras.'),
('Los Roques', 'island', 'Venezuela', 'Archipiélago paradisíaco de aguas cristalinas.'),
('Canaima', 'park', 'Venezuela', 'Hogar del Salto Ángel, la caída de agua más alta del mundo.'),
('Caracas', 'city', 'Venezuela', 'La capital, centro cultural y de negocios.'),
('Mérida', 'city', 'Venezuela', 'Los Andes venezolanos, teleférico y montañas.');

-- Hoteles
INSERT INTO hotels (name, destination_id, stars, price_per_night, rating) VALUES 
('Wyndham Concorde', (SELECT id FROM destinations WHERE name='Isla de Margarita'), 5, 120.00, 4.8),
('Hesperia Isla Margarita', (SELECT id FROM destinations WHERE name='Isla de Margarita'), 5, 110.00, 4.5),
('Posada Galápagos', (SELECT id FROM destinations WHERE name='Los Roques'), 4, 350.00, 4.9),
('Waku Lodge', (SELECT id FROM destinations WHERE name='Canaima'), 5, 450.00, 5.0),
('Hotel Humboldt', (SELECT id FROM destinations WHERE name='Caracas'), 5, 200.00, 4.7);

-- Tours
INSERT INTO tours (title, destination_id, type, duration_days, price) VALUES 
('Full Day Isla de Coche', (SELECT id FROM destinations WHERE name='Isla de Margarita'), 'Playa', 1, 45.00),
('Jeep Safari 4x4', (SELECT id FROM destinations WHERE name='Isla de Margarita'), 'Aventura', 1, 60.00),
('Expedición Salto Ángel', (SELECT id FROM destinations WHERE name='Canaima'), 'Aventura', 3, 500.00),
('Catamarán a Noronky', (SELECT id FROM destinations WHERE name='Los Roques'), 'Navegación', 1, 90.00);

-- Vuelos (Rutas Frecuentes)
INSERT INTO flights (airline, from_code, to_code, price, class) VALUES 
('Conviasa', 'CCS', 'PMV', 50.00, 'Economy'),
('Laser', 'CCS', 'PMV', 60.00, 'Economy'),
('Conviasa', 'CCS', 'LRV', 120.00, 'Economy'),
('Rutaca', 'CCS', 'LSP', 80.00, 'Economy');
