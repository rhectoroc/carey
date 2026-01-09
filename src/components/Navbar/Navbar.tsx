"use client";

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Menu, Globe, User } from 'lucide-react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === 'es' ? 'en' : 'es');
    };

    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.logo}>
                {/* 
                  Note: The image is expected at /public/logoCarey.jpeg. 
                  If not present, it will fallback or show broken image style, 
                  so we keep text as alt or backup if needed, but here we use Next/Image 
                */}
                <img src="/LogoCarey01.png" alt="Carey Logo" style={{ height: '50px', objectFit: 'contain' }} />
            </Link>

            <div className={styles.links}>
                <Link href="/" className={styles.link}>{t('nav.home')}</Link>
                <Link href="/about" className={styles.link}>{t('nav.about')}</Link>
                <Link href="/destinations" className={styles.link}>{t('nav.destinations')}</Link>
                <Link href="/contact" className={styles.link}>{t('nav.contact')}</Link>
            </div>

            <div className={styles.actions}>
                <button onClick={toggleLanguage} className={styles.langBtn} title="Cambiar Idioma">
                    <Globe size={18} style={{ marginRight: 5 }} />
                    {language.toUpperCase()}
                </button>
                <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`${styles.menuOverlay} ${mobileMenuOpen ? styles.open : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Drawer */}
            <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
                <button className={styles.closeMenuBtn} onClick={() => setMobileMenuOpen(false)}>×</button>
                <Link href="/" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.home')}</Link>
                <Link href="/about" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.about')}</Link>
                <Link href="/destinations" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.destinations')}</Link>
                <Link href="/contact" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.contact')}</Link>
            </div>
        </nav>
    );
}
