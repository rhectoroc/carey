"use client";

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import styles from './HeroSlider.module.css';

// Register ScrollTrigger
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const slides = [
    {
        id: 'playa',
        title: 'Playa',
        subtitle: 'Paraíso Tropical. Aguas cristalinas y arenas blancas para tu descanso absoluto.',
        color: '#E0F2F1', // Light teal/blue
        image: '/images/destinations/los-roques-hero.jpg', // Placeholder
        link: '/destinations?type=playa'
    },
    {
        id: 'aventura',
        title: 'Aventura',
        subtitle: 'Naturaleza indomable. Explora los rincones más salvajes y emocionantes.',
        color: '#F1F8E9', // Light green
        image: '/images/destinations/canaima-hero.jpg', // Placeholder
        link: '/destinations?type=aventura'
    },
    {
        id: 'ciudad',
        title: 'Ciudad',
        subtitle: 'Vida cosmopolita. Cultura, gastronomía y entretenimiento de primer nivel.',
        color: '#ECEFF1', // Light blue-grey
        image: '/images/destinations/caracas-hero.jpg', // Placeholder
        link: '/destinations?type=ciudad'
    }
];

export default function HeroSlider() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useGSAP(() => {
        if (!containerRef.current || !sliderRef.current) return;

        const slidesElements = gsap.utils.toArray(`.${styles.slide}`) as HTMLElement[];
        if (slidesElements.length === 0) return;

        // Pin the container and animate slides
        ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: `+=${window.innerHeight * slides.length}`,
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
                // Calculate which slide is active based on progress
                const progress = self.progress;
                const index = Math.min(
                    Math.floor(progress * slides.length),
                    slides.length - 1
                );
                
                if (index !== activeIndex) {
                    setActiveIndex(index);
                }
            }
        });

            // Animate slides in sequence
            slidesElements.forEach((slide, i) => {
                if (i === 0) return; // First slide is already visible
                
                gsap.fromTo(slide,
                    { yPercent: 100 },
                    {
                        yPercent: 0,
                        ease: "none",
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: () => `top+=${(i - 1) * window.innerHeight} top`,
                            end: () => `top+=${i * window.innerHeight} top`,
                            scrub: true,
                        }
                    }
                );
            });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className={styles.heroContainer} style={{ backgroundColor: slides[activeIndex]?.color || '#ffffff' }}>
            <div ref={sliderRef} className={styles.sliderWrapper}>
                {slides.map((slide, index) => (
                    <div key={slide.id} className={`${styles.slide} ${index === activeIndex ? styles.active : ''}`}>
                        <div className={styles.content}>
                            <h1 className={styles.title}>{slide.title}</h1>
                            <p className={styles.subtitle}>{slide.subtitle}</p>
                            <Link href={slide.link} className={styles.button}>
                                EXPLORAR PRODUCTOS
                            </Link>
                        </div>
                        <div className={styles.imageContainer}>
                            <div className={styles.imagePlaceholder}>
                                {/* Using a placeholder div for the visual effect until actual images are added */}
                                <div className={styles.placeholderBottle}>
                                    <span className={styles.imageText}>{slide.title}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.pagination}>
                {slides.map((_, index) => (
                    <div key={index} className={`${styles.dot} ${index === activeIndex ? styles.activeDot : ''}`} />
                ))}
            </div>
        </div>
    );
}
