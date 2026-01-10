import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Términos y Condiciones | Carey Tour & Travel",
    description: "Términos y condiciones de servicio de Carey Tour & Travel.",
};

export default function TermsPage() {
    return (
        <main style={{ padding: '8rem 5% 4rem', maxWidth: '1000px', margin: '0 auto', color: '#333', lineHeight: '1.6' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#1F6D8C', textAlign: 'center' }}>Términos y Condiciones</h1>

            <section style={{ marginBottom: '2rem' }}>
                <p>Bienvenido a Carey Tour & Travel. Al utilizar nuestros servicios, usted acepta cumplir con los siguientes términos y condiciones. Por favor, léalos detenidamente.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>1. Servicios</h2>
                <p>Carey Tour & Travel actúa como intermediario entre el cliente y los prestadores de servicios turísticos (hoteles, aerolíneas, transportistas, etc.). Nos comprometemos a gestionar su reserva con la mayor diligencia y profesionalismo.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>2. Reservas y Pagos</h2>
                <ul style={{ paddingLeft: '20px' }}>
                    <li>Para confirmar una reserva, se requiere un depósito inicial según lo estipulado en su cotización.</li>
                    <li>El pago total debe realizarse antes de la fecha de viaje, siguiendo los plazos indicados por nuestros agentes.</li>
                    <li>Aceptamos pagos en divisas y bolívares a la tasa de cambio vigente, así como transferencias internacionales (Zelle, Wire Transfer).</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>3. Cancelaciones y Reembolsos</h2>
                <p>Las políticas de cancelación varían según el proveedor final del servicio. Carey Tour & Travel aplicará las siguientes normas generales:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li>Cancelaciones con más de 30 días de antelación pueden estar sujetas a gastos administrativos.</li>
                    <li>Cancelaciones tardías pueden incurrir en penalidades de hasta el 100% del costo, dependiendo de las políticas de hoteles y aerolíneas.</li>
                    <li>No habrá reembolsos por servicios no utilizados voluntariamente durante el viaje.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>4. Responsabilidad</h2>
                <p>Carey Tour & Travel no se hace responsable por retrasos, accidentes, pérdidas de equipaje o eventos de fuerza mayor (desastres naturales, huelgas, etc.) que afecten el itinerario. Recomendamos encarecidamente adquirir un seguro de viaje.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>5. Documentación</h2>
                <p>Es responsabilidad exclusiva del pasajero contar con la documentación necesaria para el viaje (cédula, pasaporte vigente, visas, permisos de menores, etc.).</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>6. Ley Aplicable</h2>
                <p>Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. Cualquier disputa será resuelta en los tribunales competentes del Estado Nueva Esparta.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>7. Contacto</h2>
                <p>Para cualquier duda o consulta sobre estos términos, puede contactarnos a través de:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li>Correo electrónico: info@viajes-carey.com</li>
                    <li>Teléfono: +58 412-2476575</li>
                </ul>
            </section>

            <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                Última actualización: {new Date().toLocaleDateString('es-VE')}
            </p>
        </main>
    );
}
