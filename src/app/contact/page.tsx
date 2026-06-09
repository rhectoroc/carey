import type { Metadata } from "next";
import { Mail, Phone, MapPin } from 'lucide-react';
import BackToHome from "@/components/BackToHome/BackToHome";

export const metadata: Metadata = {
    title: "Contacto | Carey Tour & Travel",
    description: "Contáctanos para planificar tu viaje.",
};

export default function ContactPage() {
    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '3rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

                <div>
                    <h1 style={{ fontSize: '3rem', color: 'var(--color-caribe-blue)', marginBottom: '1rem' }}>Contáctanos</h1>
                    <p style={{ marginBottom: '2rem', color: '#666' }}>Estamos aquí para responder todas tus dudas y ayudarte a planificar.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--color-caribe-blue)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Mail size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Email</h3>
                                <p style={{ margin: 0, color: '#666' }}>info@careytour.com</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--color-jungle-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Phone size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Teléfono</h3>
                                <p style={{ margin: 0, color: '#666' }}>+58 424 123 4567</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--color-sunset-orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Oficina</h3>
                                <p style={{ margin: 0, color: '#666' }}>Caracas, Venezuela</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    border: '1px solid #eee'
                }}>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre</label>
                            <input type="text" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd' }} placeholder="Tu nombre" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
                            <input type="email" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd' }} placeholder="tucorreo@email.com" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mensaje</label>
                            <textarea rows={4} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd' }} placeholder="¿En qué podemos ayudarte?"></textarea>
                        </div>
                        <button type="submit" style={{
                            padding: '1rem',
                            background: 'var(--color-caribe-blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '1rem'
                        }}>Enviar Mensaje</button>
                    </form>
                </div>

            </div>
            <BackToHome />
        </div>
    );
}
