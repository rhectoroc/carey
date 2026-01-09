import Link from 'next/link';
import { Home } from 'lucide-react';
import styles from './BackToHome.module.css';

export default function BackToHome() {
    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backButton}>
                <Home size={20} />
                Volver al Inicio
            </Link>
        </div>
    );
}
