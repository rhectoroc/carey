"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    return (
        <div style={{ position: 'sticky', top: '2rem', zIndex: 100, marginBottom: '-3rem', pointerEvents: 'none' }}>
            <Link href="/" style={{
                pointerEvents: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '0.8rem 1.5rem',
                borderRadius: '50px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                color: '#1F6D8C',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(-5px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                }}
            >
                <ArrowLeft size={18} />
                Volver al Inicio
            </Link>
        </div>
    );
}
