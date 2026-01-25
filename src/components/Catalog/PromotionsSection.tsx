'use client';

import React, { useState, useEffect, useRef } from 'react';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal';
import styles from './CategoryGrid.module.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function PromotionsSection() {
    const [items, setItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                // Fetch all promotions in parallel
                const [destRes, hotelRes, tourRes] = await Promise.all([
                    fetch('/api/catalog/destinations?promotion=true'),
                    fetch('/api/catalog/hotels?promotion=true'),
                    fetch('/api/catalog/tours?promotion=true')
                ]);

                const destinations = destRes.ok ? await destRes.json() : [];
                const hotels = hotelRes.ok ? await hotelRes.json() : [];
                const tours = tourRes.ok ? await tourRes.json() : [];

                const mappedDestinations = destinations.map((item: any) => mapToService(item, 'destination'));
                const mappedHotels = hotels.map((item: any) => mapToService(item, 'hotel'));
                const mappedTours = tours.map((item: any) => mapToService(item, 'tour'));

                // Combine and shuffle or sort
                let combined = [...mappedDestinations, ...mappedHotels, ...mappedTours];
                // Optional: Randomize order so it's not always Dest -> Hotel -> Tour
                combined = combined.sort(() => 0.5 - Math.random());

                setItems(combined);
            } catch (error) {
                console.error('Failed to fetch promotions', error);
            }
        };

        fetchPromotions();
    }, []);

    useEffect(() => {
        const scope = sectionRef.current;
        if (!scope || !titleRef.current || !subtitleRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: scope,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });

            tl.fromTo(titleRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            )
                .fromTo(subtitleRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
                    "-=0.5"
                );
        }, scope);

        return () => ctx.revert();
    }, [items]);

    const mapToService = (item: any, type: string) => {
        return {
            id: item.id,
            title: item.name,
            category: type === 'hotel' ? 'Hotel' : type === 'tour' ? 'Tour' : 'Destination',
            location: item.destination_name || (type === 'destination' ? item.name : ''),
            price: item.price || 0,
            price_child: item.price_child,
            price_infant: item.price_infant,
            originalPrice: item.price ? item.price * 1.2 : 0, // Mock original price for "Sale" effect?
            rating: item.stars || 5,
            image: item.image_url,
            description: item.description,
            features: item.features || item.included || [],
            duration: item.duration || '',
            priceValidUntil: item.price_valid_until,
            tags: item.tags || [],
            gallery: item.gallery || [],
            is_featured: item.is_featured,
            is_promotion: item.is_promotion !== undefined ? item.is_promotion : true,
        };
    };

    if (items.length === 0) return null;

    return (
        <section ref={sectionRef} style={{ width: '100%', background: '#fff0f0' }}> {/* Background on full-width outer */}
            <div className={styles.section}> {/* Layout constraints on inner */}
                <div className={styles.header}>
                    <h2 ref={titleRef} className={styles.title} style={{ color: '#e63946' }}>🔥 Ofertas y Promociones</h2>
                    <p ref={subtitleRef} className={styles.subtitle}>Aprovecha nuestros descuentos exclusivos por tiempo limitado.</p>
                </div>

                <div className={styles.grid}>
                    {items.map(item => (
                        <ServiceCard
                            key={`${item.category}-${item.id}`}
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
