"use client";

import { useLanguage } from '@/context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.column}>
                    <img src="/LogoCarey01.png" alt="Carey Tour & Travel" className={styles.logo} />
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
                    <h3>Legal</h3>
                    <a href="/terms">Términos y Condiciones</a>
                    <a href="/privacy">Política de Privacidad</a>
                </div>
                <div className={styles.column}>
                    <h3>Contacto</h3>
                    <p>info@careytour.com</p>
                    <p>+58 412-2476475</p>
                    <p>Isla de Margarita, Nueva Esparta</p>
                </div>
            </div>
            <div className={styles.bottom}>
                &copy; {new Date().getFullYear()} Carey Tour & Travel. All rights reserved.
            </div>
        </footer>
    );
}
