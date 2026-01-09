"use client";

import { useState } from 'react';
import { mockServices, Service } from '@/data/mockServices';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal';

export default function CategoryGrid() {
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    return (
        <section style={{ padding: '5rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{
                    fontSize: '2.5rem',
                    color: 'var(--color-caribe-blue)',
                    marginBottom: '1rem'
                }}>
                    Experiencias Destacadas
                </h2>
                <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                    Descubre lo mejor de Venezuela con nuestra selección exclusiva de destinos y aventuras.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
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
