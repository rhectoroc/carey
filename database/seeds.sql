-- Seed Data for Carey Project
-- Last updated: 2026-01-24

-- 1. Destinos
INSERT INTO destinations (name, slug, type, country, description) VALUES 
('Isla de Margarita', 'isla-margarita', 'Isla', 'Venezuela', 'La Perla del Caribe, playas y compras.'),
('Los Roques', 'los-roques', 'Parque Nacional', 'Venezuela', 'Archipiélago paradisíaco de aguas cristalinas.'),
('Canaima', 'canaima', 'Parque Nacional', 'Venezuela', 'Hogar del Salto Ángel, la caída de agua más alta del mundo.'),
('Caracas', 'caracas', 'Ciudad', 'Venezuela', 'La capital, centro cultural y de negocios.'),
('Mérida', 'merida', 'Ciudad', 'Venezuela', 'Los Andes venezolanos, teleférico y montañas.');

-- 2. Hoteles
INSERT INTO hotels (name, slug, destination_id, stars, price, rating, type) VALUES 
('Wyndham Concorde', 'wyndham-concorde', (SELECT id FROM destinations WHERE slug='isla-margarita'), 5, 120.00, 4.8, 'Hotel'),
('Hesperia Isla Margarita', 'hesperia-isla-margarita', (SELECT id FROM destinations WHERE slug='isla-margarita'), 5, 110.00, 4.5, 'Hotel'),
('Posada Galápagos', 'posada-galapagos', (SELECT id FROM destinations WHERE slug='los-roques'), 4, 350.00, 4.9, 'Posada'),
('Waku Lodge', 'waku-lodge', (SELECT id FROM destinations WHERE slug='canaima'), 5, 450.00, 5.0, 'Campamento'),
('Hotel Humboldt', 'hotel-humboldt', (SELECT id FROM destinations WHERE slug='caracas'), 5, 200.00, 4.7, 'Hotel');

-- 3. Tours
INSERT INTO tours (name, slug, destination_id, type, duration, price, stars) VALUES 
('Full Day Isla de Coche', 'full-day-coche', (SELECT id FROM destinations WHERE slug='isla-margarita'), 'Playa', '8 horas', 45.00, 5),
('Jeep Safari 4x4', 'jeep-safari-margarita', (SELECT id FROM destinations WHERE slug='isla-margarita'), 'Aventura', '6 horas', 60.00, 4),
('Expedición Salto Ángel', 'expedicion-salto-angel', (SELECT id FROM destinations WHERE slug='canaima'), 'Aventura', '3 días', 500.00, 5),
('Catamarán a Noronky', 'catamaran-noronky', (SELECT id FROM destinations WHERE slug='los-roques'), 'Navegación', '7 horas', 90.00, 5);

-- 4. Vuelos (Rutas Frecuentes)
INSERT INTO flights (airline, from_code, to_code, price, class) VALUES 
('Conviasa', 'CCS', 'PMV', 50.00, 'Economy'),
('Laser', 'CCS', 'PMV', 60.00, 'Economy'),
('Conviasa', 'CCS', 'LRV', 120.00, 'Economy'),
('Rutaca', 'CCS', 'LSP', 80.00, 'Economy');
