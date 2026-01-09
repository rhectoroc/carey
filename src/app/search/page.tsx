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

import SearchHeader from '@/components/Search/SearchHeader';
import ResultCard from '@/components/Search/ResultCard';

export default async function SearchPage({ searchParams }: SearchParamsProps) {
    // Await the searchParams promise (Required for Next.js 15+)
    const resolvedParams = await searchParams;
    const { type, location } = resolvedParams;

    // Pass resolved params to helper
    const { data: results } = await getResults(resolvedParams);

    return (
        <main className={styles.container}>
            <SearchHeader
                location={(Array.isArray(location) ? location[0] : location) || 'Todo'}
                count={results.length}
                type={(Array.isArray(type) ? type[0] : type) || 'hotels'}
            />

            <div className={styles.resultsGrid}>
                {results.length === 0 ? (
                    <div className={styles.noResults}>
                        <p>No encontramos resultados para tu búsqueda.</p>
                        <a href="/" className={styles.backBtn}>Volver al inicio</a>
                    </div>
                ) : (
                    results.map((item: any) => (
                        <ResultCard key={item.id} item={item} type={(Array.isArray(type) ? type[0] : type) || 'hotels'} />
                    ))
                )}
            </div>
        </main>
    );
}
