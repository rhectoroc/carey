import React from 'react';
import { Metadata } from 'next';
import BackButton from '@/components/Common/BackButton';

export const metadata: Metadata = {
    title: "Política de Privacidad | Carey Tour & Travel",
    description: "Política de privacidad y protección de datos de Carey Tour & Travel.",
};

export default function PrivacyPage() {
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
                        Política de Privacidad
                    </h1>

                    <div style={{ color: '#4a5568', lineHeight: '1.8' }}>
                        <section style={{ marginBottom: '3rem' }}>
                            <p style={{ fontSize: '1.1rem' }}>En Carey Tour & Travel, valoramos su privacidad y estamos comprometidos a proteger sus datos personales. Esta política describe cómo recopilamos, usamos y protegemos su información.</p>
                        </section>

                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2d3748' }}>1. Información que Recopilamos</h2>
                            <p style={{ marginBottom: '1rem' }}>Podemos recopilar la siguiente información cuando utiliza nuestros servicios:</p>
                            <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                                <li style={{ marginBottom: '0.8rem' }}>Datos personales: Nombre, dirección, correo electrónico, número de teléfono.</li>
                                <li style={{ marginBottom: '0.8rem' }}>Datos de viaje: Pasaportes, fechas de viaje, preferencias de alojamiento y dietéticas.</li>
                                <li style={{ marginBottom: '0.8rem' }}>Información técnica: Dirección IP y datos de navegación en nuestro sitio web.</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2d3748' }}>2. Uso de la Información</h2>
                            <p style={{ marginBottom: '1rem' }}>Utilizamos sus datos para:</p>
                            <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                                <li style={{ marginBottom: '0.8rem' }}>Procesar y confirmar sus reservas de viaje.</li>
                                <li style={{ marginBottom: '0.8rem' }}>Enviarle itinerarios, facturas y comunicaciones importantes.</li>
                                <li style={{ marginBottom: '0.8rem' }}>Mejorar nuestros servicios y personalizar su experiencia.</li>
                                <li style={{ marginBottom: '0.8rem' }}>Cumplir con obligaciones legales.</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2d3748' }}>3. Protección de Datos</h2>
                            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información contra el acceso no autorizado, la pérdida o la alteración. Solo compartimos sus datos con terceros (aerolíneas, hoteles) cuando es estrictamente necesario para la prestación del servicio contratado.</p>
                        </section>

                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2d3748' }}>4. Sus Derechos</h2>
                            <p>Usted tiene derecho a acceder, rectificar o solicitar la eliminación de sus datos personales. Para ejercer estos derechos, puede contactarnos a través de nuestros canales oficiales.</p>
                        </section>

                        <section style={{ marginBottom: '3rem', backgroundColor: '#f7fafc', padding: '2rem', borderRadius: '12px' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1F6D8C' }}>5. Contacto</h2>
                            <p style={{ marginBottom: '1rem' }}>Si tiene preguntas sobre esta política de privacidad, por favor contáctenos:</p>
                            <ul style={{ paddingLeft: '20px', listStyleType: 'none', margin: 0 }}>
                                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <strong>Email:</strong> info@viajes-carey.com
                                </li>
                                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <strong>Dirección:</strong> Isla de Margarita, Nueva Esparta, Venezuela.
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
