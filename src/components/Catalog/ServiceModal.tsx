"use client";

import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Service } from '@/data/mockServices';
import { Info, Clock, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useChatbot } from '@/context/ChatbotContext';
import { useLanguage } from '@/context/LanguageContext';
import { getFeatureIcon } from './ServiceCard';
import styles from './ServiceModal.module.css';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}

import QuoteForm from '../Quotes/QuoteForm';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}

export default function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
    const { t, language } = useLanguage();
    const { openChatbot } = useChatbot();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [view, setView] = useState<'details' | 'quote'>('details');

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

    const isPriceExpired = useMemo(() => {
        if (!service?.priceValidUntil) return false;
        const today = new Date();
        const validUntil = new Date(service.priceValidUntil);
        return today > validUntil;
    }, [service]);

    const isPriceHidden = service?.show_price_publicly === false || isPriceExpired;

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setCurrentImageIndex(0);
            setView('details'); // Reset to details on open
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen || !service) return null;

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

    // Use Portal to ensure modal is always on top of everything
    const modalContent = (
        <div className={styles.overlay} onClick={onClose} style={{ zIndex: 9999 }}>
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

                <div className={styles.content} style={{ overflowY: view === 'quote' ? 'auto' : undefined }}>

                    {view === 'quote' ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {/* Small header adjustment for embedded form */}
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#C5A059', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                                    Cotizador Inteligente
                                </h4>
                            </div>
                            <QuoteForm
                                embedded
                                preSelectedService={service}
                                onBack={() => setView('details')}
                                onClose={onClose}
                            />
                        </div>
                    ) : (
                        <>
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
                                                {t('catalog.offer').toUpperCase()} 🔥
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
                                                {t('catalog.featured').toUpperCase()} ⭐
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
                                    {service.description || t('modal.defaultDesc')}
                                </p>
                            </div>

                            {/* Pricing Section */}
                            {(service.price || service.price_child || service.price_infant || (service.pricing_matrix && service.pricing_matrix.length > 0)) && (
                                <div className={styles.section}>
                                    <h4 className={styles.sectionTitle}>{t('modal.details')}</h4>

                                    {isPriceHidden ? (
                                        <div style={{
                                            background: '#fff5f5',
                                            border: '1px solid #feb2b2',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            color: '#c53030',
                                            fontWeight: '600'
                                        }}>
                                            {isPriceExpired ? 'Tarifa caducada - Consultar disponibilidad y precio' : 'Consultar disponibilidad y precio'}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Standard Pricing Grid */}
                                            {(!service.pricing_matrix || service.pricing_matrix.length === 0) && (
                                                <div className={styles.pricingGrid}>
                                                    {service.price && (
                                                        <div className={styles.priceItem}>
                                                            <span className={styles.priceLabel}>{t('modal.adults')}</span>
                                                            <span className={styles.priceValue}>${service.price}</span>
                                                        </div>
                                                    )}
                                                    {service.price_child && (
                                                        <div className={styles.priceItem}>
                                                            <span className={styles.priceLabel}>{t('modal.children')} (4-10)</span>
                                                            <span className={styles.priceValue}>${service.price_child}</span>
                                                        </div>
                                                    )}
                                                    {service.price_infant && (
                                                        <div className={styles.priceItem}>
                                                            <span className={styles.priceLabel}>{t('modal.infants')} (0-3)</span>
                                                            <span className={styles.priceValue}>${service.price_infant}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Pricing Matrix Table */}
                                            {service.pricing_matrix && service.pricing_matrix.length > 0 && (
                                                <div style={{ overflowX: 'auto', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                                        <thead>
                                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                                                <th style={{ padding: '8px' }}>Habitación</th>
                                                                <th style={{ padding: '8px' }}>Ocupación</th>
                                                                <th style={{ padding: '8px' }}>Plan</th>
                                                                <th style={{ padding: '8px', textAlign: 'right' }}>Precio</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {service.pricing_matrix.map((row, idx) => (
                                                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                    <td style={{ padding: '8px' }}>{row.room_type}</td>
                                                                    <td style={{ padding: '8px' }}>{row.occupancy}</td>
                                                                    <td style={{ padding: '8px' }}>{row.plan_type}</td>
                                                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-primary-teal)' }}>${row.price}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {service.priceValidUntil && (
                                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Info size={14} /> {t('modal.validUntil')} {new Date(service.priceValidUntil).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {service.features && service.features.length > 0 && (
                                <div className={styles.section}>
                                    <h4 className={styles.sectionTitle}>{t('modal.includes')}</h4>
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

                            <div className={styles.footerActions}>
                                <button
                                    className={styles.actionButton}
                                    style={{ flex: 1, background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0' }}
                                    onClick={handleConsultar}
                                >
                                    💬 Consultar con EVA
                                </button>
                                <button
                                    className={styles.actionButton}
                                    style={{ flex: 1, background: 'var(--color-primary-teal)', color: 'white', fontWeight: 'bold' }}
                                    onClick={() => setView('quote')}
                                >
                                    COTIZAR AHORA
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
