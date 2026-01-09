"use client";

import { useEffect } from 'react';
import { Service } from '@/data/mockServices';
import { X, MapPin } from 'lucide-react';
import { useChatbot } from '@/context/ChatbotContext';
import styles from './ServiceModal.module.css';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}

export default function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
    const { openChatbot } = useChatbot();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !service) return null;

    const handleConsultar = () => {
        const message = `Requiero más información acerca de ${service.title.toLowerCase()}`;
        onClose(); // Close modal first
        setTimeout(() => {
            openChatbot(message);
        }, 300); // Small delay for smooth transition
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.imageContainer}>
                    <img src={service.image} alt={service.title} className={styles.image} />
                </div>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <span className={styles.category}>{service.category}</span>
                        <h3 className={styles.title}>{service.title}</h3>
                        <div className={styles.location}>
                            <MapPin size={18} />
                            {service.location}
                        </div>
                    </div>

                    <p className={styles.description}>
                        {service.description || "Descripción no disponible por el momento."}
                    </p>

                    <div className={styles.footer}>
                        <div className={styles.price}>
                            <span>desde</span> ${service.price}
                        </div>
                        <button className={styles.actionButton} onClick={handleConsultar}>
                            Consultar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
