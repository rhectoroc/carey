import React from 'react';
import styles from '../admin.module.css';

export default function DashboardPage() {
    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Dashboard</h1>
            </div>
            <p>Welcome to the Carey Tours Admin Panel. Select a module from the sidebar to manage content.</p>
        </div>
    );
}
