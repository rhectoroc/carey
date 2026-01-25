"use client";

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { gsap } from 'gsap';
import TravelSearch from './TravelSearch';
import styles from './Hero.module.css';

export default function Hero() {
    const { t } = useLanguage();
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const brandTitleContainerRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
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

            if (brandTitleContainerRef.current) {
                const words = brandTitleContainerRef.current.querySelectorAll('.brand-word');
                gsap.fromTo(words,
                    { y: 100, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        stagger: 0.15,
                        ease: "expo.out",
                        delay: 0.5
                    }
                );
            }
        });
        return () => ctx.revert();
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
            >
                <source src="/hero-video.mp4" type="video/mp4" />
            </video>

            <div className={styles.overlay}></div>

            <div className={styles.content}>
                <h1 ref={brandTitleContainerRef} className={styles.title} style={{ overflow: 'hidden' }}>
                    <span className={`${styles.brandTitle} brand-word`} style={{ display: 'inline-block' }}>Carey</span>{' '}
                    <span className={`${styles.brandTitle} brand-word`} style={{ display: 'inline-block' }}>Tour</span>{' '}
                    <span className={`${styles.brandTitle} brand-word`} style={{ display: 'inline-block' }}>&</span>{' '}
                    <span className={`${styles.brandTitle} brand-word`} style={{ display: 'inline-block' }}>Travel</span> <br />
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
