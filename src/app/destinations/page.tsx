"use client";

import { useState } from 'react';
import type { Metadata } from "next";
import { mockServices } from '@/data/mockServices';
import DestinationFilter from '@/components/Catalog/DestinationFilter';
import ServiceCard from '@/components/Catalog/ServiceCard';
import ServiceModal from '@/components/Catalog/ServiceModal';
import BackToHome from '@/components/BackToHome/BackToHome';
import { Service } from '@/data/mockServices';

export default function DestinationsPage() {
    const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const filteredServices = selectedDestination
        ? mockServices.filter(service => service.destination === selectedDestination)
        : mockServices;

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--color-jungle-green)' }}>Destinos Exclusivos</h1>
                <p>Selecciona tu próxima aventura.</p>
            </div>

            <DestinationFilter
                selectedDestination={selectedDestination}
                onSelectDestination={setSelectedDestination}
            />

            <section style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {filteredServices.map(service => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onClick={() => setSelectedService(service)}
                        />
                    ))}
                </div>

                {filteredServices.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                        <p>No hay servicios disponibles para este destino.</p>
                    </div>
                )}
            </section>

            <BackToHome />

            <ServiceModal
                isOpen={!!selectedService}
                onClose={() => setSelectedService(null)}
                service={selectedService}
            />
        </div>
    );
}
