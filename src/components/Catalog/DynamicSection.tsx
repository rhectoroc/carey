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
    variant?: 'luxuryFlow' | 'default';
}

export default function DynamicSection({ title, subtitle, endpoint, type, className, sectionId, bgImage, variant }: DynamicSectionProps) {
    const [items, setItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const shapesRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);

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
        const scope = bgRef.current;
        if (!scope || !bgImage) return;

        const ctx = gsap.context(() => {
            gsap.to(scope, {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }, scope);

        return () => ctx.revert();
    }, [bgImage, items]); // Re-run when items load to ensure correct height

    useEffect(() => {
        const scope = containerRef.current;
        if (variant !== 'luxuryFlow' || !shapesRef.current || !scope) return;

        const ctx = gsap.context(() => {
            const shapes = shapesRef.current?.children;
            if (!shapes) return;

            Array.from(shapes).forEach((shape, i) => {
                // Initial positions spread out horizontally
                gsap.set(shape, {
                    xPercent: gsap.utils.random(-20, 20),
                    yPercent: gsap.utils.random(-20, 20),
                });

                // Clear Horizontal Oscillating Movement
                gsap.to(shape, {
                    xPercent: i % 2 === 0 ? 100 : -100, // Move left or right depending on index
                    duration: gsap.utils.random(10, 15),
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: i * 2,
                });

                // Subtle vertical float to keep it organic
                gsap.to(shape, {
                    yPercent: "+=30",
                    duration: gsap.utils.random(5, 8),
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            });

            // Parallax movement on scroll
            gsap.to(shapesRef.current, {
                yPercent: -10,
                ease: "none",
                scrollTrigger: {
                    trigger: scope,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }, scope);

        return () => ctx.revert();
    }, [variant, items]);

    useEffect(() => {
        const scope = containerRef.current;
        if (!headerRef.current || !titleRef.current || !subtitleRef.current || !scope) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: headerRef.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });

            tl.fromTo(titleRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, ease: "power4.out" }
            )
                .fromTo(subtitleRef.current,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, ease: "power4.out" },
                    "-=0.7" // Start slightly before title finished
                );
        }, scope);

        return () => ctx.revert();
    }, [items]); // Re-run when items are loaded to ensure correct positioning

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

            {variant === 'luxuryFlow' && (
                <div
                    ref={shapesRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        opacity: 0.8
                    }}
                >
                    {/* Intensified blobs */}
                    <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,109,140,0.5) 0%, rgba(31,109,140,0) 70%)', top: '-10%', left: '-5%', filter: 'blur(60px)' }}></div>
                    <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,72,34,0.4) 0%, rgba(242,72,34,0) 70%)', bottom: '10%', right: '-5%', filter: 'blur(50px)' }}></div>
                    <div style={{ position: 'absolute', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,109,140,0.4) 0%, rgba(31,109,140,0) 70%)', top: '20%', right: '15%', filter: 'blur(80px)' }}></div>
                </div>
            )}

            <div className={styles.section} style={{ position: 'relative', zIndex: 1 }}>
                <div className={styles.header} ref={headerRef}>
                    <h2 className={styles.title} ref={titleRef}>{title}</h2>
                    <p className={styles.subtitle} ref={subtitleRef}>{subtitle}</p>
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
