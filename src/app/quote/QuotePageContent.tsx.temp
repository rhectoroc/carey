import { Suspense } from 'react';
import QuotePageContent from './QuotePageContent';

export default function QuotePage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
            }}>
                <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 600 }}>
                    Cargando cotizador...
                </div>
            </div>
        }>
            <QuotePageContent />
        </Suspense>
    );
}
