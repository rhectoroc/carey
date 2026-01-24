'use client';

import React, { useState, useEffect } from 'react';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal'; // Reusing existing modal if compatible
import styles from './CategoryGrid.module.css'; // Reusing grid styles

interface DynamicSectionProps {
    title: string;
    subtitle: string;
    endpoint: string;
    type: 'hotel' | 'tour' | 'destination';
}

export default function DynamicSection({ title, subtitle, endpoint, type }: DynamicSectionProps) {
    const [items, setItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(endpoint);
                if (res.ok) {
                    const data = await res.json();
                    const mapped = data.map((item: any) => mapToService(item, type));
                    setItems(mapped);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };

        fetchData();
    }, [endpoint, type]);

    const mapToService = (item: any, type: string) => {
        // Map API data to ServiceCard interface
        return {
            id: item.id,
            title: item.name,
            category: type === 'hotel' ? 'Hotel' : type === 'tour' ? 'Tour' : 'Destination',
            location: item.destination_name || (type === 'destination' ? item.name : ''),
            price: item.price || 0,
            rating: item.stars || 5,
            image: item.image_url || 'https://via.placeholder.com/400x300?text=No+Image', // Fallback
            description: item.description,
            features: item.features || item.included || [],
            // Add other mock fields if required by ServiceModal
            duration: item.duration || '',
            images: [item.image_url],
            reviews: 0
        };
    };

    if (items.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.subtitle}>{subtitle}</p>
            </div>

            <div className={styles.grid}>
                {items.map(item => (
                    <ServiceCard
                        key={item.id}
                        service={item}
                        onClick={() => setSelectedItem(item)}
                    />
                ))}
            </div>

            {selectedItem && (
                <ServiceModal
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    service={selectedItem}
                />
            )}
        </section>
    );
}
