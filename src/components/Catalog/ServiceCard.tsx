"use client";

import React, { useState } from 'react';
import { Service } from '@/data/mockServices';
import { MapPin, Star, Utensils, Bus, Car, Martini, Cookie, PartyPopper, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
    service: Service;
    onClick?: () => void;
}

const getFeatureIcon = (feature: string) => {
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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = service.gallery && service.gallery.length > 0 ? service.gallery : [service.image];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className={styles.card} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            <div className={styles.imageContainer} style={{ position: 'relative' }}>
                <img src={images[currentImageIndex]} alt={service.title} className={styles.image} />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            style={{ position: 'absolute', left: '5px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer', display: 'flex' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={nextImage}
                            style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer', display: 'flex' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
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
                            color: 'var(--color-primary-teal)',
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
            </div>
            <div className={styles.content}>
                <span className={styles.category}>{service.category}</span>
                <h3 className={styles.title}>{service.title}</h3>
                <div className={styles.location}>
                    <MapPin size={16} />
                    {service.location}
                </div>

                {service.features && service.features.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '10px 0' }}>
                        {service.features.slice(0, 5).map((feature, idx) => (
                            <div key={idx} title={feature} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#555', background: '#f1f5f9', padding: '4px 8px', borderRadius: '12px' }}>
                                {getFeatureIcon(feature)}
                                <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{feature}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.footer}>
                    {service.priceValidUntil && new Date(service.priceValidUntil) < new Date() ? (
                        <div className={styles.consultButton} style={{
                            backgroundColor: 'var(--color-primary-teal)',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>
                            Consultar tarifa
                        </div>
                    ) : (
                        <div className={styles.price}>
                            <span>desde</span> ${service.price}
                        </div>
                    )}
                    <div className={styles.rating}>
                        <Star size={16} fill="var(--color-sunset-orange)" />
                        {service.rating}
                    </div>
                </div>
            </div>
        </div>
    );
}
