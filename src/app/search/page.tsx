import React from 'react';
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
    
    // Fallback to empty if URL is not defined during build, though it shouldn't happen in production
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
        const res = await fetch(`${apiUrl}/api/search?type=${type}&location=${encodeURIComponent(location)}`, {
            cache: 'no-store'
        });
        
        if (!res.ok) {
            console.error("API Error in getResults:", res.statusText);
            return { type, data: [] };
        }
        
        const json = await res.json();
        return { type: json.type || type, data: json.data || [] };
    } catch (e) {
        console.error("Fetch Error in getResults:", e);
        return { type, data: [] };
    }
}

import SearchHeader from '@/components/Search/SearchHeader';
import ResultCard from '@/components/Search/ResultCard';

export default async function SearchPage({ searchParams }: SearchParamsProps) {
    // Await the searchParams promise (Required for Next.js 15+)
    const resolvedParams = await searchParams;

    // Pass resolved params to helper
    const { data: results, type: searchType } = await getResults(resolvedParams);

    const displayLocation = (Array.isArray(resolvedParams.location) ? resolvedParams.location[0] : resolvedParams.location) || 'Todo el país';
    const displayType = (Array.isArray(resolvedParams.type) ? resolvedParams.type[0] : resolvedParams.type) || 'hotels';

    return (
        <main className={styles.container}>
            <SearchHeader
                location={displayLocation}
                count={results.length}
                type={displayType}
            />

            <div className={styles.resultsGrid}>
                {results.length === 0 ? (
                    <div className={styles.noResults}>
                        <p>No encontramos resultados para tu búsqueda.</p>
                        <a href="/" className={styles.backBtn}>Volver al inicio</a>
                    </div>
                ) : (
                    results.map((item: any) => (
                        <ResultCard key={item.id} item={item} type={displayType} />
                    ))
                )}
            </div>
        </main>
    );
}
