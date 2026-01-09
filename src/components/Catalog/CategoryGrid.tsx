"use client";

import { useState } from 'react';
import { mockServices, Service } from '@/data/mockServices';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal';
import styles from './CategoryGrid.module.css';

export default function CategoryGrid() {
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    Experiencias Destacadas
                </h2>
                <p className={styles.subtitle}>
                    Descubre lo mejor de Venezuela con nuestra selección exclusiva de destinos y aventuras.
                </p>
            </div>

            <div className={styles.grid}>
                {mockServices.map(service => (
                    <ServiceCard
                        key={service.id}
                        service={service}
                        onClick={() => setSelectedService(service)}
                    />
                ))}
            </div>

            <ServiceModal
                isOpen={!!selectedService}
                onClose={() => setSelectedService(null)}
                service={selectedService}
            />
        </section>
    );
}
