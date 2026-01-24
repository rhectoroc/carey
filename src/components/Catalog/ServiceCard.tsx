"use client";

import { Service } from '@/data/mockServices';
import { MapPin, Star } from 'lucide-react';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
    service: Service;
    onClick?: () => void;
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
    return (
        <div className={styles.card} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            <div className={styles.imageContainer}>
                <img src={service.image} alt={service.title} className={styles.image} />
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
