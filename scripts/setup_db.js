const { Client } = require('pg');

const config = {
    user: 'postgres',
    password: 'DVA3w2M6RZpA',
    host: 'adrielshealthcore_postgres',
    port: 5432,
    // Connect to default 'postgres' db first to create new db
    database: 'postgres',
    ssl: false
};

const targetDB = 'careytour';

async function setup() {
    const client = new Client(config);
    try {
        await client.connect();
        console.log('Connected to postgres...');

        // Check if DB exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${targetDB}'`);
        if (res.rowCount === 0) {
            console.log(`Creating database ${targetDB}...`);
            await client.query(`CREATE DATABASE "${targetDB}"`);
            console.log(`Database ${targetDB} created.`);
        } else {
            console.log(`Database ${targetDB} already exists.`);
        }
        await client.end();

        // Connect to new DB
        const careyClient = new Client({ ...config, database: targetDB });
        await careyClient.connect();
        console.log(`Connected to ${targetDB}...`);

        // Create Tables
        console.log('Creating tables...');

        // Destinations
        await careyClient.query(`
            CREATE TABLE IF NOT EXISTS destinations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL, -- 'city', 'airport', 'island'
                country VARCHAR(100) DEFAULT 'Venezuela',
                description TEXT
            );
        `);

        // Hotels
        await careyClient.query(`
            CREATE TABLE IF NOT EXISTS hotels (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                destination_id INTEGER REFERENCES destinations(id),
                stars INTEGER,
                price_per_night DECIMAL(10,2),
                description TEXT,
                image_url TEXT
            );
        `);

        // Tours
        await careyClient.query(`
            CREATE TABLE IF NOT EXISTS tours (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                destination_id INTEGER REFERENCES destinations(id),
                type VARCHAR(100), -- 'Beach', 'Adventure', etc.
                duration_days INTEGER,
                price DECIMAL(10,2),
                description TEXT
            );
        `);

        // Flights (Mock)
        await careyClient.query(`
            CREATE TABLE IF NOT EXISTS flights (
                id SERIAL PRIMARY KEY,
                airline VARCHAR(100),
                from_location VARCHAR(100),
                to_location VARCHAR(100),
                departure_time TIMESTAMP,
                arrival_time TIMESTAMP,
                price DECIMAL(10,2),
                class VARCHAR(50) -- 'Economy', 'Business'
            );
        `);

        // Seed Data if empty
        const destCount = await careyClient.query('SELECT COUNT(*) FROM destinations');
        if (parseInt(destCount.rows[0].count) === 0) {
            console.log('Seeding data...');

            // Destinations
            await careyClient.query(`
                INSERT INTO destinations (name, type, country) VALUES 
                ('Isla de Margarita', 'island', 'Venezuela'),
                ('Los Roques', 'island', 'Venezuela'),
                ('Canaima', 'park', 'Venezuela'),
                ('Caracas', 'city', 'Venezuela'),
                ('Mérida', 'city', 'Venezuela'),
                ('Morrocoy', 'park', 'Venezuela')
            `);

            // Fetch IDs for linking
            const margarita = (await careyClient.query("SELECT id FROM destinations WHERE name = 'Isla de Margarita'")).rows[0].id;
            const roques = (await careyClient.query("SELECT id FROM destinations WHERE name = 'Los Roques'")).rows[0].id;
            const canaima = (await careyClient.query("SELECT id FROM destinations WHERE name = 'Canaima'")).rows[0].id;

            // Hotels
            await careyClient.query(`
                INSERT INTO hotels (name, destination_id, stars, price_per_night) VALUES 
                ('Wyndham Concorde', ${margarita}, 5, 120.00),
                ('Hesperia Isla Margarita', ${margarita}, 5, 110.00),
                ('Posada Galápagos', ${roques}, 4, 250.00),
                ('Waku Lodge', ${canaima}, 5, 300.00)
            `);

            // Tours
            await careyClient.query(`
                INSERT INTO tours (title, destination_id, type, duration_days, price) VALUES 
                ('Full Day Coche', ${margarita}, 'Beach', 1, 50.00),
                ('Jeep Safari Margarita', ${margarita}, 'Adventure', 1, 60.00),
                ('Salto Angel Expedition', ${canaima}, 'Adventure', 3, 450.00),
                ('Los Roques Catamaran', ${roques}, 'Sailing', 1, 100.00)
            `);

            // Flights
            await careyClient.query(`
                INSERT INTO flights (airline, from_location, to_location, price, class) VALUES 
                ('Conviasa', 'Caracas', 'Porlamar', 50.00, 'Economy'),
                ('Laser', 'Caracas', 'Porlamar', 60.00, 'Economy'),
                ('Conviasa', 'Caracas', 'Los Roques', 120.00, 'Economy')
            `);
        }

        console.log('Setup complete!');
        await careyClient.end();

    } catch (err) {
        console.error('Error during setup:', err);
    }
}

setup();
