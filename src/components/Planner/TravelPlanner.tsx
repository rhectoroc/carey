"use client";

import { useLanguage } from '@/context/LanguageContext';
import { Plane, CalendarCheck, FileQuestion } from 'lucide-react';

export default function TravelPlanner() {
    const { t } = useLanguage();

    return (
        <section style={{
            background: 'linear-gradient(135deg, var(--color-caribe-blue) 0%, #0099cc 100%)',
            padding: '5rem 5%',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-10%',
                width: '500px',
                height: '500px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(50px)'
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Asesoría Integral de Viajes</h2>
                <p style={{ fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto', opacity: 0.9 }}>
                    Diseñamos tu viaje a la medida. Desde la logística hasta los pequeños detalles, deja que nuestros expertos se encarguen de todo.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                    {[
                        { icon: FileQuestion, title: 'Consulta Inicial', text: 'Cuéntanos tus sueños y presupuesto.' },
                        { icon: Plane, title: 'Diseño del Plan', text: 'Creamos un itinerario personalizado.' },
                        { icon: CalendarCheck, title: 'Reservas & Gestión', text: 'Nos encargamos de toda la logística.' }
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            padding: '2rem',
                            borderRadius: '20px',
                            width: '300px',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <item.icon size={40} style={{ marginBottom: '1rem', opacity: 0.9 }} />
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{item.text}</p>
                        </div>
                    ))}
                </div>

                <button style={{
                    padding: '1rem 3rem',
                    fontSize: '1.2rem',
                    background: 'white',
                    color: 'var(--color-caribe-blue)',
                    border: 'none',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s'
                }}>
                    Contáctanos
                </button>
            </div>
        </section>
    );
}
