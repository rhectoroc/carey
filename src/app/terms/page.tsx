import React from 'react';
import { Metadata } from 'next';
import BackButton from '@/components/Common/BackButton';

export const metadata: Metadata = {
    title: "Términos y Condiciones | Carey Tour & Travel",
    description: "Términos y condiciones de servicio de Carey Tour & Travel.",
};

export default function TermsPage() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <main style={{ padding: '4rem 5%', maxWidth: '1000px', margin: '0 auto' }}>
                <BackButton />

                <div style={{
                    marginTop: '4rem',
                    backgroundColor: 'white',
                    padding: '4rem',
                    borderRadius: '24px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
                }}>
                    <h1 style={{
                        fontSize: '3rem',
                        marginBottom: '3rem',
                        color: '#1F6D8C',
                        textAlign: 'center',
                        fontWeight: '700',
                        letterSpacing: '-0.02em'
                    }}>
                        Términos y Condiciones
                    </h1>

                    <div style={{ color: '#4a5568', lineHeight: '1.8' }}>
                        <section style={{ marginBottom: '3rem' }}>
                            <p style={{ fontSize: '1.1rem' }}>Bienvenido a Carey Tour & Travel. Al utilizar nuestros servicios, usted acepta cumplir con los siguientes términos y condiciones. Por favor, léalos detenidamente.</p>
                        </section>

                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2d3748' }}>1. Servicios</h2>
                            <p>Carey Tour & Travel actúa como intermediario entre el cliente y los prestadores de servicios turísticos (hoteles, aerolíneas, transportistas, etc.). Nos comprometemos a gestionar su reserva con la mayor diligencia y profesionalismo.</p>
                        </section>

                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2d3748' }}>2. Reservas y Pagos</h2>
                            <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                                <li style={{ marginBottom: '0.8rem' }}>Para confirmar una reserva, se requiere un depósito inicial según lo estipulado en su cotización.</li>
                                <li style={{ marginBottom: '0.8rem' }}>El pago total debe realizarse antes de la fecha de viaje, siguiendo los plazos indicados por nuestros agentes.</li>
                                <li style={{ marginBottom: '0.8rem' }}>Aceptamos pagos en divisas y bolívares a la tasa de cambio vigente, así como transferencias internacionales (Zelle, Wire Transfer).</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2d3748' }}>3. Cancelaciones y Reembolsos</h2>
                            <p style={{ marginBottom: '1rem' }}>Las políticas de cancelación varían según el proveedor final del servicio. Carey Tour & Travel aplicará las siguientes normas generales:</p>
                            <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                                <li style={{ marginBottom: '0.8rem' }}>Cancelaciones con más de 30 días de antelación pueden estar sujetas a gastos administrativos.</li>
                                <li style={{ marginBottom: '0.8rem' }}>Cancelaciones tardías pueden incurrir en penalidades de hasta el 100% del costo, dependiendo de las políticas de hoteles y aerolíneas.</li>
                                <li style={{ marginBottom: '0.8rem' }}>No habrá reembolsos por servicios no utilizados voluntariamente durante el viaje.</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2d3748' }}>4. Responsabilidad</h2>
                            <p>Carey Tour & Travel no se hace responsable por retrasos, accidentes, pérdidas de equipaje o eventos de fuerza mayor (desastres naturales, huelgas, etc.) que afecten el itinerario. Recomendamos encarecidamente adquirir un seguro de viaje.</p>
                        </section>

                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2d3748' }}>5. Documentación</h2>
                            <p>Es responsabilidad exclusiva del pasajero contar con la documentación necesaria para el viaje (cédula, pasaporte vigente, visas, permisos de menores, etc.).</p>
                        </section>

                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2d3748' }}>6. Ley Aplicable</h2>
                            <p>Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. Cualquier disputa será resuelta en los tribunales competentes del Estado Nueva Esparta.</p>
                        </section>

                        <section style={{ marginBottom: '3rem', backgroundColor: '#f7fafc', padding: '2rem', borderRadius: '12px' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1F6D8C' }}>7. Contacto</h2>
                            <p style={{ marginBottom: '1rem' }}>Para cualquier duda o consulta sobre estos términos, puede contactarnos a través de:</p>
                            <ul style={{ paddingLeft: '20px', listStyleType: 'none', margin: 0 }}>
                                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <strong>Correo electrónico:</strong> info@viajes-carey.com
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <strong>Teléfono:</strong> +58 412-2476575
                                </li>
                            </ul>
                        </section>

                        <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#718096', borderTop: '1px solid #e2e8f0', paddingTop: '2rem', textAlign: 'center' }}>
                            Última actualización: {new Date().toLocaleDateString('es-VE')}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
