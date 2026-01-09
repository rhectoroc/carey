import React from 'react';
import { query } from '@/lib/db';
import styles from './search.module.css';
import { MapPin, Star, Calendar, Users, Briefcase } from 'lucide-react';
import Image from 'next/image';

interface SearchParams {
    searchParams: {
        type?: string;
        location?: string;
        checkIn?: string;
        checkOut?: string;
        adults?: string;
        origin?: string;
    }
}

async function getResults(params: SearchParams['searchParams']) {
    const type = params.type || 'hotels';
    const location = params.location || '';

    try {
        if (type === 'hotels') {
            const sql = `
                SELECT h.*, d.name as destination_name 
                FROM hotels h
                JOIN destinations d ON h.destination_id = d.id
                WHERE d.name ILIKE $1
            `;
            const res = await query(sql, [`%${location}%`]);
            return { type, data: res.rows };
        }
        else if (type === 'tours') {
            const sql = `
                SELECT t.*, d.name as destination_name
                FROM tours t
                JOIN destinations d ON t.destination_id = d.id
                WHERE d.name ILIKE $1
            `;
            const res = await query(sql, [`%${location}%`]);
            return { type, data: res.rows };
        }
        else if (type === 'flights') {
            // Mock flights search based on origin/dest
            return { type, data: [] }; // Initial placeholder
        }
    } catch (e) {
        console.error("DB Error", e);
        return { type, data: [] };
    }
    return { type, data: [] };
}

export default async function SearchPage({ searchParams }: SearchParams) {
    const { type, location } = searchParams;
    const { data: results } = await getResults(searchParams);

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1>Resultados para "{location || 'Todo'}"</h1>
                <p>{results.length} opciones encontradas en {type === 'tours' ? 'Experiencias' : type === 'flights' ? 'Vuelos' : 'Hoteles'}</p>
            </header>

            <div className={styles.resultsGrid}>
                {results.length === 0 ? (
                    <div className={styles.noResults}>
                        <p>No encontramos resultados para tu búsqueda.</p>
                        <a href="/" className={styles.backBtn}>Volver al inicio</a>
                    </div>
                ) : (
                    results.map((item: any) => (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.cardImage}>
                                {/* Using placeholder as we don't have real images yet */}
                                <div className={styles.placeholderImg}>
                                    {type === 'hotels' ? <Briefcase /> : <MapPin />}
                                </div>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.cardHeader}>
                                    <h3>{item.name || item.title}</h3>
                                    {item.stars && (
                                        <div className={styles.rating}>
                                            <Star size={14} fill="#FFD700" color="#FFD700" />
                                            <span>{item.stars}</span>
                                        </div>
                                    )}
                                </div>
                                <p className={styles.location}>
                                    <MapPin size={14} /> {item.destination_name}
                                </p>
                                {item.description && <p className={styles.desc}>{item.description}</p>}
                                <div className={styles.cardFooter}>
                                    <div className={styles.price}>
                                        <small>Desde</small>
                                        <span>${item.price_per_night || item.price}</span>
                                    </div>
                                    <button className={styles.bookBtn}>Ver Disponibilidad</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
