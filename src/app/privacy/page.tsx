import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Política de Privacidad | Carey Tour & Travel",
    description: "Política de privacidad y protección de datos de Carey Tour & Travel.",
};

export default function PrivacyPage() {
    return (
        <main style={{ padding: '8rem 5% 4rem', maxWidth: '1000px', margin: '0 auto', color: '#333', lineHeight: '1.6' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#1F6D8C', textAlign: 'center' }}>Política de Privacidad</h1>

            <section style={{ marginBottom: '2rem' }}>
                <p>En Carey Tour & Travel, valoramos su privacidad y estamos comprometidos a proteger sus datos personales. Esta política describe cómo recopilamos, usamos y protegemos su información.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>1. Información que Recopilamos</h2>
                <p>Podemos recopilar la siguiente información cuando utiliza nuestros servicios:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li>Datos personales: Nombre, dirección, correo electrónico, número de teléfono.</li>
                    <li>Datos de viaje: Pasaportes, fechas de viaje, preferencias de alojamiento y dietéticas.</li>
                    <li>Información técnica: Dirección IP y datos de navegación en nuestro sitio web.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>2. Uso de la Información</h2>
                <p>Utilizamos sus datos para:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li>Procesar y confirmar sus reservas de viaje.</li>
                    <li>Enviarle itinerarios, facturas y comunicaciones importantes.</li>
                    <li>Mejorar nuestros servicios y personalizar su experiencia.</li>
                    <li>Cumplir con obligaciones legales.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>3. Protección de Datos</h2>
                <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información contra el acceso no autorizado, la pérdida o la alteración. Solo compartimos sus datos con terceros (aerolíneas, hoteles) cuando es estrictamente necesario para la prestación del servicio contratado.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>4. Sus Derechos</h2>
                <p>Usted tiene derecho a acceder, rectificar o solicitar la eliminación de sus datos personales. Para ejercer estos derechos, puede contactarnos a través de nuestros canales oficiales.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1F6D8C' }}>5. Contacto</h2>
                <p>Si tiene preguntas sobre esta política de privacidad, por favor contáctenos:</p>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                    <li><strong>Email:</strong> info@careytour.com</li>
                    <li><strong>Dirección:</strong> Isla de Margarita, Nueva Esparta, Venezuela.</li>
                    <li><strong>Teléfono:</strong> +58 412-2476475</li>
                </ul>
            </section>

            <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                Última actualización: {new Date().toLocaleDateString('es-VE')}
            </p>
        </main>
    );
}
