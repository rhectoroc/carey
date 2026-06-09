"use client";

import styles from './DestinationFilter.module.css';

const DESTINATIONS = ['Los Roques', 'Canaima', 'Isla de Margarita', 'Mérida'] as const;

interface DestinationFilterProps {
    selectedDestination: string | null;
    onSelectDestination: (destination: string | null) => void;
}

export default function DestinationFilter({ selectedDestination, onSelectDestination }: DestinationFilterProps) {
    return (
        <div className={styles.filterContainer}>
            <button
                className={`${styles.filterButton} ${selectedDestination === null ? styles.active : ''}`}
                onClick={() => onSelectDestination(null)}
            >
                Todos
            </button>
            {DESTINATIONS.map(destination => (
                <button
                    key={destination}
                    className={`${styles.filterButton} ${selectedDestination === destination ? styles.active : ''}`}
                    onClick={() => onSelectDestination(destination)}
                >
                    {destination}
                </button>
            ))}
        </div>
    );
}
