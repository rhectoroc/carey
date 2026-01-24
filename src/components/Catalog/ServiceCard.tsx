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
