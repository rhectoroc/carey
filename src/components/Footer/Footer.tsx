"use client";

import { useLanguage } from '@/context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.column}>
                    <h3>CAREY TOUR & TRAVEL</h3>
                    <p>Viajes exclusivos y experiencias inolvidables en Venezuela y el Caribe.</p>
                </div>
                <div className={styles.column}>
                    <h3>Enlaces Rápidos</h3>
                    <a href="/">{t('nav.home')}</a>
                    <a href="/destinations">{t('nav.destinations')}</a>
                    <a href="/about">{t('nav.about')}</a>
                    <a href="/contact">{t('nav.contact')}</a>
                </div>
                <div className={styles.column}>
                    <h3>Contacto</h3>
                    <p>info@careytour.com</p>
                    <p>+58 212 123 4567</p>
                    <p>Caracas, Venezuela</p>
                </div>
            </div>
            <div className={styles.bottom}>
                &copy; {new Date().getFullYear()} Carey Tour & Travel. All rights reserved.
            </div>
        </footer>
    );
}
