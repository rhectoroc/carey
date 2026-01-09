"use client";

import { useState } from 'react';
import { MapPin, Star, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import styles from '@/app/search/search.module.css';

interface ResultCardProps {
    item: any; // Using any for flexibility with DB rows
    type: string;
}

export default function ResultCard({ item, type }: ResultCardProps) {
    // Mocking an image array since DB only has one string currently
    // We will use the db image + some placeholders for the carousel effect
    const images = [
        item.image_url || null,
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80"
    ].filter(Boolean); // Filter out nulls

    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentSlide((prev) => (prev + 1) % images.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardImage}>
                {images.length > 0 ? (
                    <>
                        <img
                            src={images[currentSlide]}
                            alt={item.name}
                            className={styles.carouselImg}
                        />
                        {images.length > 1 && (
                            <>
                                <button onClick={prevSlide} className={`${styles.navBtn} ${styles.prevBtn}`}>
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={nextSlide} className={`${styles.navBtn} ${styles.nextBtn}`}>
                                    <ChevronRight size={20} />
                                </button>
                                <div className={styles.dots}>
                                    {images.map((_, idx) => (
                                        <span
                                            key={idx}
                                            className={`${styles.dot} ${idx === currentSlide ? styles.activeDot : ''}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className={styles.placeholderImg}>
                        {type === 'hotels' ? <Briefcase /> : <MapPin />}
                    </div>
                )}
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
    );
}
