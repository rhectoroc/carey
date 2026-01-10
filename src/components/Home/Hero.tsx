"use client";

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { gsap } from 'gsap';
import TravelSearch from './TravelSearch';
import styles from './Hero.module.css';

export default function Hero() {
    const { t } = useLanguage();
    const subtitleRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (subtitleRef.current) {
            const fullText = "Servicios Turísticos Integrales";
            subtitleRef.current.innerText = "";

            const obj = { val: 0 };
            gsap.to(obj, {
                val: fullText.length,
                duration: 3,
                delay: 0.8,
                ease: "none",
                onUpdate: () => {
                    if (subtitleRef.current) {
                        subtitleRef.current.innerText = fullText.slice(0, Math.round(obj.val));
                    }
                }
            });

            gsap.fromTo(subtitleRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.5, delay: 0.8 }
            );
        }
    }, []);

    return (
        <section className={styles.hero}>
            {/* Video Background Placeholder - Replace src with actual asset */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className={styles.videoBg}
                poster="/hero-poster.jpg" // You should add a placeholder image in public
            >
                <source src="/hero-video.mp4" type="video/mp4" />
            </video>

            <div className={styles.overlay}></div>

            <div className={styles.content}>
                <h1 className={styles.title}>
                    <span className={styles.brandTitle}>Carey Tour & Travel</span> <br />
                    <span className={styles.venezuela}>Venezuela</span>
                </h1>
                <p ref={subtitleRef} className={styles.subtitle}>
                    Servicios Turísticos Integrales
                </p>

                <TravelSearch />
            </div>
        </section>
    );
}
