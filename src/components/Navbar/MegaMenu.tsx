"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import styles from './MegaMenu.module.css';

interface MegaMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const categories = [
    {
        title: "Playa",
        image: "/images/destinations/los-roques-hero.jpg",
        links: [
            { name: "Los Roques", href: "/destinations/los-roques" },
            { name: "Margarita", href: "/destinations/margarita" },
            { name: "Morrocoy", href: "/destinations/morrocoy" },
            { name: "Los Testigos", href: "/destinations/los-testigos" }
        ]
    },
    {
        title: "Aventura",
        image: "/images/destinations/canaima-hero.jpg",
        links: [
            { name: "Canaima", href: "/destinations/canaima" },
            { name: "Salto Ángel", href: "/destinations/salto-angel" },
            { name: "Roraima", href: "/destinations/roraima" },
            { name: "Amazonas", href: "/destinations/amazonas" }
        ]
    },
    {
        title: "Montaña",
        image: "/images/destinations/merida-hero.jpg",
        links: [
            { name: "Mérida", href: "/destinations/merida" },
            { name: "Pico Bolívar", href: "/destinations/pico-bolivar" },
            { name: "Colonia Tovar", href: "/destinations/colonia-tovar" },
            { name: "El Ávila", href: "/destinations/el-avila" }
        ]
    },
    {
        title: "Ciudad",
        image: "/images/destinations/caracas-hero.jpg",
        links: [
            { name: "Caracas", href: "/destinations/caracas" },
            { name: "Maracaibo", href: "/destinations/maracaibo" },
            { name: "Valencia", href: "/destinations/valencia" },
            { name: "Barquisimeto", href: "/destinations/barquisimeto" }
        ]
    },
    {
        title: "Especiales",
        image: "/images/destinations/llanos-hero.jpg",
        links: [
            { name: "Los Llanos", href: "/destinations/los-llanos" },
            { name: "Médanos de Coro", href: "/destinations/medanos" },
            { name: "Relámpago del Catatumbo", href: "/destinations/catatumbo" },
            { name: "Tours de Observación", href: "/tours/observacion" }
        ]
    }
];

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className={styles.megaMenuOverlay}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                >
                    <div className={styles.megaMenuContainer}>
                        {categories.map((category, index) => (
                            <motion.div 
                                key={index} 
                                className={styles.column}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                            >
                                <h3 className={styles.categoryTitle}>{category.title}</h3>
                                
                                {/* Placeholder for destination 3D object / image */}
                                <div className={styles.imageWrapper}>
                                    <div className={styles.imagePlaceholder}>
                                        <span>{category.title}</span>
                                    </div>
                                </div>
                                
                                <ul className={styles.linkList}>
                                    {category.links.map((link, i) => (
                                        <li key={i} className={styles.listItem}>
                                            <Link href={link.href} onClick={onClose} className={styles.link}>
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
