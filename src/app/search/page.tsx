import React from 'react';
import { query } from '@/lib/db';
import styles from './search.module.css';
import { MapPin, Star, Calendar, Users, Briefcase } from 'lucide-react';
import Image from 'next/image';

// Next.js 15+ requires searchParams to be a Promise
type SearchParamsProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getResults(params: { [key: string]: string | string[] | undefined }) {
    const type = (params.type as string) || 'hotels';
    const location = (params.location as string) || '';

    console.log('Search Params (Server):', { type, location }); // DEBUG

    try {
        if (type === 'hotels') {
            const sql = `
                SELECT h.*, d.name as destination_name 
                FROM hotels h
                JOIN destinations d ON h.destination_id = d.id
                WHERE d.name ILIKE $1
            `;
            const res = await query(sql, [`%${location}%`]);
            console.log(`DB Query Hotels found: ${res.rows.length}`); // DEBUG
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
            console.log(`DB Query Tours found: ${res.rows.length}`); // DEBUG
            return { type, data: res.rows };
        }
        else if (type === 'flights') {
            // Mock flights search based on origin/dest
            return { type, data: [] }; // Initial placeholder
        }
    } catch (e) {
        console.error("DB Error in getResults:", e);
        return { type, data: [] };
    }
    return { type, data: [] };
}

export default async function SearchPage({ searchParams }: SearchParamsProps) {
    // Await the searchParams promise (Required for Next.js 15+)
    const resolvedParams = await searchParams;
    const { type, location } = resolvedParams;

    // Pass resolved params to helper
    const { data: results } = await getResults(resolvedParams);

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
