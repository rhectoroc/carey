"use client";

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/app/search/search.module.css'; // Reusing existing module or creating new? Let's assume we use the one we have or pass classes.
// Actually better to have its own or inline styles for specific animations, but reusing search.module.css is fine if we export it. 
// I'll use the existing module classes but I might need to adjust the import in page.tsx or make this component use the same css file.
// For simplicity in Next.js app dir, let's assume we pass the styles or import them here.
// Since CSS modules are scoped, importing it here works.

interface SearchHeaderProps {
    location: string;
    count: number;
    type: string;
}

export default function SearchHeader({ location, count, type }: SearchHeaderProps) {
    const titleRef = useRef(null);
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(titleRef.current, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });

            gsap.from(".header-meta", {
                y: 20,
                opacity: 0,
                duration: 0.8,
                delay: 0.3,
                ease: "power2.out"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className={styles.header}>
            <div className={styles.logoWatermark}>
                <Image
                    src="/images/logo_carey.png" // Assuming this path exists or verify
                    alt="Carey Logo"
                    width={100}
                    height={100}
                    style={{ opacity: 0.1 }}
                />
            </div>

            <Link href="/" className={styles.headerBackBtn}>
                ← Volver al Inicio
            </Link>

            <h1 ref={titleRef}>Resultados para "{location || 'Todo'}"</h1>
            <p className="header-meta">
                {count} opciones encontradas en {type === 'tours' ? 'Experiencias' : type === 'flights' ? 'Vuelos' : 'Hoteles'}
            </p>
        </div>
    );
}
