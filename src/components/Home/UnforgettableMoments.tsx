"use client";

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, Play } from 'lucide-react';
import styles from './UnforgettableMoments.module.css';

gsap.registerPlugin(ScrollTrigger);

// Mock Data
const moments = [
    {
        id: 1,
        title: "Life's Beach Tours",
        location: "Jeep Safari",
        description: "Full Day Jeep Safari Tour Naturaleza 4x4",
        video: "/videos/lifebeach.mp4", // Placeholder
        thumbnail: "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1920&auto=format&fit=crop", // Sailing
    },
    {
        id: 2,
        title: "Atardecer en Macanao",
        location: "Peninsula de Macanao",
        description: "Siente la inmensidad del desierto y la calidez de un atardecer inolvidable en las dunas de Falcón.",
        video: "/videos/macanao.mp4",
        thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1920&auto=format&fit=crop", // Dunes
    },
    {
        id: 3,
        title: "Aventura en Cubagua",
        location: "Isla de Cubagua",
        description: "Disfruta de la belleza natural de la isla de Cubagua.",
        video: "/videos/cubagua.mp4",
        thumbnail: "https://images.unsplash.com/photo-1589785834890-48e02d4f3b25?q=80&w=1920&auto=format&fit=crop", // Mountain
    },
    {
        id: 4,
        title: "Buceo en Mochima",
        location: "Parque Nacional Mochima",
        description: "Sumérgete en la biodiversidad marina de nuestras costas. Un encuentro cercano con la naturaleza.",
        video: "/videos/mochima-diving.mp4",
        thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1920&auto=format&fit=crop", // Diving
    }
];

export default function UnforgettableMoments() {
    const [selectedMoment, setSelectedMoment] = useState<typeof moments[0] | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate items sliding in
            itemsRef.current.forEach((item, index) => {
                if (!item) return;

                const isEven = index % 2 === 0;
                const xStart = isEven ? -100 : 100; // Left or Right start

                gsap.fromTo(item,
                    {
                        xPercent: xStart,
                        opacity: 0,
                        scale: 0.95
                    },
                    {
                        xPercent: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: item,
                            start: "top 85%", // Trigger when item enters viewport
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

            // Animate Title
            if (titleRef.current) {
                gsap.fromTo(titleRef.current,
                    { y: -50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top 80%"
                        }
                    }
                );
            }

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.momentsSection}>
            <div className={styles.container}>
                <h2 ref={titleRef} className={styles.sectionTitle}>Momentos Inolvidables</h2>
                <div className={styles.momentsGrid}>
                    {moments.map((moment, index) => (
                        <div
                            key={moment.id}
                            ref={el => { itemsRef.current[index] = el }}
                            className={`${styles.momentCard} ${index % 2 === 0 ? styles.slideRight : styles.slideLeft} ${index % 2 !== 0 ? styles.reverseLayout : ''}`}
                            onClick={() => setSelectedMoment(moment)}
                        >
                            <div className={styles.imageWrapper}>
                                <video
                                    src={moment.video}
                                    className={styles.thumbnail}
                                    muted
                                    autoPlay
                                    loop
                                    playsInline
                                />

                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{moment.title}</h3>
                                <p className={styles.cardLocation}>{moment.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {selectedMoment && (
                <div className={styles.modalOverlay} onClick={() => setSelectedMoment(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setSelectedMoment(null)}>
                            <X size={24} />
                        </button>

                        <div className={styles.videoContainer}>
                            <video
                                src={selectedMoment.video}
                                controls
                                autoPlay
                                loop
                                className={styles.video}
                            />
                        </div>

                        <div className={styles.modalInfo}>
                            <h3 className={styles.modalTitle}>{selectedMoment.title}</h3>
                            <p className={styles.modalLocation}>{selectedMoment.location}</p>
                            <p className={styles.modalDescription}>{selectedMoment.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
