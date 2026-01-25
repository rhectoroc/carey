"use client";

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/context/LanguageContext';
import { X, Play } from 'lucide-react';
import styles from './UnforgettableMoments.module.css';

gsap.registerPlugin(ScrollTrigger);

// Mock Data
export default function UnforgettableMoments() {
    const { t } = useLanguage();
    const [momentsList, setMomentsList] = useState<any[]>([]);
    const [selectedMoment, setSelectedMoment] = useState<any | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
    const videoThumbnailsRef = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        fetch('/api/moments')
            .then(res => res.json())
            .then(data => setMomentsList(data))
            .catch(err => console.error("Error loading moments:", err));
    }, []);

    useEffect(() => {
        if (momentsList.length === 0 || !sectionRef.current) return;
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

            // Video Playback on Scroll
            videoThumbnailsRef.current.forEach((video) => {
                if (!video) return;

                ScrollTrigger.create({
                    trigger: video,
                    start: "top bottom",
                    end: "bottom top",
                    onEnter: () => video.play(),
                    onLeave: () => video.pause(),
                    onEnterBack: () => video.play(),
                    onLeaveBack: () => video.pause()
                });
            });

            // Animate Title
            if (titleRef.current) {
                gsap.fromTo(titleRef.current,
                    { y: 30, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top 85%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            }

        }, sectionRef.current);

        return () => ctx.revert();
    }, [momentsList]);

    return (
        <section ref={sectionRef} className={styles.momentsSection}>
            <div className={styles.container}>
                <h2 ref={titleRef} className={styles.sectionTitle}>{t('home.moments') || 'Momentos Inolvidables'}</h2>
                {momentsList.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        Cargando momentos increíbles...
                    </div>
                )}
                <div className={styles.momentsGrid}>
                    {momentsList.map((moment, index) => (
                        <div
                            key={moment.id}
                            ref={el => { itemsRef.current[index] = el }}
                            className={`${styles.momentCard} ${index % 2 === 0 ? styles.slideRight : styles.slideLeft} ${index % 2 !== 0 ? styles.reverseLayout : ''}`}
                            onClick={() => setSelectedMoment(moment)}
                        >
                            <div className={styles.imageWrapper}>
                                <video
                                    ref={el => { videoThumbnailsRef.current[index] = el }}
                                    src={moment.video_url}
                                    className={styles.thumbnail}
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
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
                                src={selectedMoment.video_url}
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
