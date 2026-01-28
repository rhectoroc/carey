import QuoteForm from '@/components/Quotes/QuoteForm';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { Suspense } from 'react';

export const metadata = {
    title: 'Cotizador de Viajes | Carey Tour',
    description: 'Calcula tu presupuesto para hoteles y tours en Venezuela.'
};

export default function QuotePage() {
    return (
        <main>
            <Navbar />
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Cargando cotizador...</div>}>
                <QuoteForm />
            </Suspense>
            <Footer />
        </main>
    );
}
