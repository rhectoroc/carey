import React from 'react';
import styles from '../admin.module.css';

export default function DashboardPage() {
    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Panel de Control</h1>
            </div>
            <p>Bienvenido al Panel de Administración de Carey Tours. Seleccione un módulo de la barra lateral para gestionar el contenido.</p>
        </div>
    );
}
