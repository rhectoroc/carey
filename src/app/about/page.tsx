import type { Metadata } from "next";
import BackToHome from "@/components/BackToHome/BackToHome";

export const metadata: Metadata = {
    title: "Nosotros | Carey Tour & Travel",
    description: "Conoce nuestra historia y pasión por Venezuela.",
};

export default function AboutPage() {
    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '3rem' }}>
            <section style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--color-caribe-blue)', marginBottom: '1rem' }}>Nosotros</h1>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
                    En <strong>Carey Tour & Travel</strong>, no solo vendemos viajes; creamos experiencias inolvidables.
                    Inspirados por la majestuosidad de la tortuga Carey y las aguas cristalinas del Caribe,
                    nuestro equipo se dedica a mostrar lo mejor de Venezuela al mundo.
                </p>
                <div style={{ marginTop: '3rem', height: '300px', background: '#e0e0e0', borderRadius: '20px' }}>
                    {/* Placeholder for Team/Office Image */}
                </div>
            </section>
            <BackToHome />
        </div>
    );
}
