"use client";

import { useEffect, useState, useMemo } from 'react';
import { Service } from '@/data/mockServices';
import { X, MapPin, ChevronLeft, ChevronRight, Info, Clock } from 'lucide-react';
import { useChatbot } from '@/context/ChatbotContext';
import { getFeatureIcon } from './ServiceCard';
import styles from './ServiceModal.module.css';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}

export default function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
    const { openChatbot } = useChatbot();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = useMemo(() => {
        if (!service) return [];
        let list = service.gallery && service.gallery.length > 0 ? [...service.gallery] : [service.image];
        if (service.image && !list.includes(service.image)) {
            list = [service.image, ...list];
        } else if (service.image && list.indexOf(service.image) > 0) {
            const index = list.indexOf(service.image);
            list.splice(index, 1);
            list.unshift(service.image);
        }
        return list;
    }, [service]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setCurrentImageIndex(0);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !service) return null;

    const handleConsultar = () => {
        const title = service.title;
        const category = service.category.toLowerCase();
        let actionMessage = `reservar el ${service.title}`;

        if (category.includes('tour') || category.includes('excursión')) {
            actionMessage = `reservar el tour: ${title}`;
        } else if (category.includes('hotel') || category.includes('posada') || category.includes('estancia')) {
            actionMessage = `reservar una estancia en el ${title}`;
        } else if (category.includes('traslado') || category.includes('transfer') || category.includes('vehículo')) {
            actionMessage = `solicitar el servicio de traslado: ${title}`;
        }

        const message = `¡Hola Carey! 👋 Me gustaría recibir más información y ${actionMessage} en ${service.location}. ¿Podrían ayudarme con el proceso?`;

        onClose();
        setTimeout(() => {
            openChatbot(message);
        }, 300);
    };

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

    const isVideo = (url: string) => url?.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.imageSection}>
                    <div className={styles.imageContainer}>
                        {isVideo(images[currentImageIndex]) ? (
                            <video
                                src={images[currentImageIndex]}
                                className={styles.image}
                                autoPlay
                                loop
                                playsInline
                            />
                        ) : (
                            <img src={images[currentImageIndex]} alt={service.title} className={styles.image} />
                        )}

                        {images.length > 1 && (
                            <>
                                <button className={`${styles.navButton} ${styles.prevButton}`} onClick={prevImage}>
                                    <ChevronLeft size={24} />
                                </button>
                                <button className={`${styles.navButton} ${styles.nextButton}`} onClick={nextImage}>
                                    <ChevronRight size={24} />
                                </button>
                                <div className={styles.carouselNav}>
                                    {images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`${styles.dot} ${idx === currentImageIndex ? styles.dotActive : ''}`}
                                            onClick={() => setCurrentImageIndex(idx)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <span className={styles.category}>{service.category}</span>
                        <h3 className={styles.title}>{service.title}</h3>
                        <div className={styles.location}>
                            <MapPin size={18} />
                            {service.location}
                        </div>
                        {service.duration && (
                            <div className={styles.location} style={{ marginTop: '5px', color: 'var(--color-primary-teal)', fontWeight: '500' }}>
                                <Clock size={16} />
                                {service.duration}
                            </div>
                        )}
                        {((service.tags && service.tags.length > 0) || service.is_promotion || service.is_featured) && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                                {service.is_promotion && (
                                    <span style={{
                                        backgroundColor: '#e63946',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    }}>
                                        OFERTA 🔥
                                    </span>
                                )}
                                {service.is_featured && (
                                    <span style={{
                                        backgroundColor: '#FFD700',
                                        color: '#000',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    }}>
                                        DESTACADO ⭐
                                    </span>
                                )}
                                {service.tags?.map((tag, index) => (
                                    <span key={index} style={{
                                        backgroundColor: '#fff',
                                        color: 'red',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        border: '1px solid #fee2e2'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.section}>
                        <p className={styles.description}>
                            {service.description || "Disfruta de una experiencia única diseñada para brindarte los mejores momentos."}
                        </p>
                    </div>

                    {(service.price || service.price_child || service.price_infant) && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>Tarifas detalladas</h4>
                            <div className={styles.pricingGrid}>
                                {service.price && (
                                    <div className={styles.priceItem}>
                                        <span className={styles.priceLabel}>Adultos</span>
                                        <span className={styles.priceValue}>${service.price}</span>
                                    </div>
                                )}
                                {service.price_child && (
                                    <div className={styles.priceItem}>
                                        <span className={styles.priceLabel}>Niños (4-10)</span>
                                        <span className={styles.priceValue}>${service.price_child}</span>
                                    </div>
                                )}
                                {service.price_infant && (
                                    <div className={styles.priceItem}>
                                        <span className={styles.priceLabel}>Infantes (0-3)</span>
                                        <span className={styles.priceValue}>${service.price_infant}</span>
                                    </div>
                                )}
                            </div>
                            {service.priceValidUntil && (
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Info size={14} /> Tarifas vigentes hasta el {new Date(service.priceValidUntil).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    )}

                    {service.features && service.features.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>¿Qué incluye?</h4>
                            <div className={styles.featuresGrid}>
                                {service.features.map((feature, idx) => (
                                    <div key={idx} className={styles.featureItem}>
                                        <div className={styles.featureIcon}>
                                            {getFeatureIcon(feature)}
                                        </div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.footer}>
                        <button className={styles.actionButton} onClick={handleConsultar}>
                            Reservar Ahora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
