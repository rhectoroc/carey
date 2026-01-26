"use client";

import React, { useState } from 'react';
import { Service } from '@/data/mockServices';
import { MapPin, Star, Utensils, Bus, Car, Martini, Cookie, PartyPopper, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
    service: Service;
    onClick?: () => void;
}

export const getFeatureIcon = (feature: string) => {
    const lower = feature.toLowerCase();
    if (lower.includes('almuerzo') || lower.includes('comida') || lower.includes('cena')) return <Utensils size={14} />;
    if (lower.includes('transporte') || lower.includes('traslado') || lower.includes('bus')) return <Bus size={14} />;
    if (lower.includes('carro') || lower.includes('jeep')) return <Car size={14} />;
    if (lower.includes('bebida') || lower.includes('hidratacion')) return <Martini size={14} />;
    if (lower.includes('snack') || lower.includes('merienda')) return <Cookie size={14} />;
    if (lower.includes('recreacion') || lower.includes('actividad')) return <PartyPopper size={14} />;
    return <CheckCircle size={14} />;
};

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
    const { t } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Ensure the main image (service.image) is at the beginning of the images list if it's not already
    const images = React.useMemo(() => {
        let list = service.gallery && service.gallery.length > 0 ? [...service.gallery] : [service.image];
        if (service.image && !list.includes(service.image)) {
            list = [service.image, ...list];
        } else if (service.image && list.indexOf(service.image) > 0) {
            // Move it to the front
            const index = list.indexOf(service.image);
            list.splice(index, 1);
            list.unshift(service.image);
        }
        return list;
    }, [service.gallery, service.image]);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const isMainMedia = images[currentImageIndex] === service.image;

    return (
        <div className={`${styles.card} card-anim-target`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', opacity: 0 }}>
            <div className={styles.imageContainer} style={{ position: 'relative' }}>
                {images[currentImageIndex]?.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) ? (
                    <video
                        src={images[currentImageIndex]}
                        className={styles.image}
                        muted
                        autoPlay
                        loop
                        playsInline
                        style={{ objectFit: 'cover' }}
                    />
                ) : images[currentImageIndex] ? (
                    <img src={images[currentImageIndex]} alt={service.title} className={styles.image} />
                ) : (
                    <div className={styles.imagePlaceholder} style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{t('catalog.noImage')}</span>
                    </div>
                )}

                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className={styles.navButton}
                            style={{ position: 'absolute', left: '5px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer', display: 'flex', zIndex: 10 }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={nextImage}
                            className={styles.navButton}
                            style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer', display: 'flex', zIndex: 10 }}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', zIndex: 5 }}>
                            {images.map((_, idx) => (
                                <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)' }} />
                            ))}
                        </div>
                    </>
                )}

                <div className={styles.tagsContainer} style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {service.tags && service.tags.map((tag, index) => (
                        <span key={index} style={{
                            backgroundColor: 'white',
                            color: 'red',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>

                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                    {service.is_promotion && (
                        <span style={{
                            backgroundColor: '#e63946',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                        }}>
                            {t('catalog.offer')} 🔥
                        </span>
                    )}
                    {service.is_featured && (
                        <span style={{
                            backgroundColor: '#FFD700',
                            color: '#000',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                        }}>
                            {t('catalog.featured')} ⭐
                        </span>
                    )}
                </div>
            </div>
            <div className={styles.content}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={styles.category}>{service.category}</span>
                    <div className={styles.rating} style={{ margin: 0 }}>
                        <Star size={14} fill="#FFD700" color="#FFD700" />
                        {service.rating}
                    </div>
                </div>
                <h3 className={styles.title}>{service.title}</h3>
                <div className={styles.location}>
                    <MapPin size={14} />
                    {service.location}
                </div>

                {service.features && service.features.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '12px 0' }}>
                        {service.features.map((feature, idx) => (
                            <div key={idx} title={feature} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: '#f8fafc', borderRadius: '6px', color: 'var(--color-primary-teal)', border: '1px solid #e2e8f0' }}>
                                {getFeatureIcon(feature)}
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.footer}>
                    {service.priceValidUntil && new Date(service.priceValidUntil) < new Date() ? (
                        <div className={styles.consultButton} style={{
                            backgroundColor: 'var(--color-primary-teal)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>
                            {t('catalog.consult')}
                        </div>
                    ) : (
                        <div className={styles.price}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>{t('catalog.from')}</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-dark)' }}> ${service.price}</span>
                        </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {service.duration}
                    </div>
                </div>
            </div>
        </div>
    );
}
