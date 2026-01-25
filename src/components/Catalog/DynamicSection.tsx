'use client';

import React, { useState, useEffect, useRef } from 'react';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal'; // Reusing existing modal if compatible
import styles from './CategoryGrid.module.css'; // Reusing grid styles
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface DynamicSectionProps {
    title: string;
    subtitle: string;
    endpoint: string;
    type: 'hotel' | 'tour' | 'destination' | 'vehicle';
    className?: string;
    sectionId?: string;
    bgImage?: string;
}

export default function DynamicSection({ title, subtitle, endpoint, type, className, sectionId, bgImage }: DynamicSectionProps) {
    const [items, setItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!bgRef.current || !bgImage) return;

        const ctx = gsap.context(() => {
            gsap.to(bgRef.current, {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        return () => ctx.revert();
    }, [bgImage, items]); // Re-run when items load to ensure correct height

    const mapToService = (item: any, type: string) => {
        // Map API data to ServiceCard interface
        return {
            id: item.id,
            title: item.name,
            category: type === 'hotel' ? 'Hotel' : type === 'tour' ? 'Tour' : type === 'vehicle' ? 'Vehicle' : 'Destination',
            location: item.destination_name || (type === 'destination' ? item.name : ''),
            price: item.price || 0,
            price_child: item.price_child,
            price_infant: item.price_infant,
            rating: item.stars || 5,
            image: item.image_url, // No fallback placeholder
            description: item.description,
            features: item.features || item.included || [],
            // Add other mock fields if required by ServiceModal
            duration: item.duration || '',
            priceValidUntil: item.price_valid_until,
            tags: item.tags || [],
            gallery: item.gallery || [],
            is_featured: item.is_featured,
            is_promotion: item.is_promotion,
            reviews: 0
        };
    };

    if (items.length === 0) return null;

    return (
        <section
            id={sectionId}
            ref={containerRef}
            className={`${className} ${bgImage ? styles.withBg : ''}`}
            style={{ width: '100%', position: 'relative', overflow: 'hidden' }}
        >
            {bgImage && (
                <div
                    ref={bgRef}
                    className={styles.sectionBg}
                    style={{
                        backgroundImage: `url(${bgImage})`,
                        position: 'absolute',
                        top: '-30%',
                        left: 0,
                        width: '100%',
                        height: '160%',
                        zIndex: 0,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.15,
                        pointerEvents: 'none'
                    }}
                />
            )}
            <div className={styles.section} style={{ position: 'relative', zIndex: 1 }}>
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
