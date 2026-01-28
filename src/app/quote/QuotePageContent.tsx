'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Calendar,
    Users,
    Mail,
    Phone,
    User,
    CreditCard,
    MapPin,
    Check,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Hotel,
    Compass
} from 'lucide-react';
import styles from './QuotePage.module.css';

export default function QuotePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        // Step 1: Service Selection
        serviceType: 'hotel', // 'hotel' or 'tour'
        hotelId: '',
        tourId: '',

        // Step 2: Dates & Guests
        checkIn: '',
        checkOut: '',
        adults: 2,
        children_4_10: 0,
        children_0_3: 0,

        // Step 3: Extras
        selectedExtras: [] as any[],

        // Step 4: Contact Info
        firstName: '',
        lastName: '',
        documentId: '',
        email: '',
        phone: ''
    });

    const [hotels, setHotels] = useState<any[]>([]);
    const [tours, setTours] = useState<any[]>([]);
    const [extras, setExtras] = useState<{ tours: any[], transfers: any[] }>({ tours: [], transfers: [] });
    const [totalPrice, setTotalPrice] = useState(0);

    // Initialize dates
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);

        setFormData(prev => ({
            ...prev,
            checkIn: tomorrow.toISOString().split('T')[0],
            checkOut: dayAfter.toISOString().split('T')[0]
        }));

        // Load initial data
        fetch('/api/catalog/hotels').then(r => r.json()).then(setHotels).catch(console.error);
        fetch('/api/catalog/tours').then(r => r.json()).then(setTours).catch(console.error);

        // Check URL params
        const hotelParam = searchParams.get('hotel_id');
        const tourParam = searchParams.get('tour_id');

        if (hotelParam) {
            setFormData(prev => ({ ...prev, serviceType: 'hotel', hotelId: hotelParam }));
        } else if (tourParam) {
            setFormData(prev => ({ ...prev, serviceType: 'tour', tourId: tourParam }));
        }
    }, [searchParams]);

    // Load extras when hotel changes
    useEffect(() => {
        if (formData.serviceType === 'hotel' && formData.hotelId) {
            const hotel = hotels.find(h => h.id === Number(formData.hotelId));
            if (hotel?.destination_id) {
                Promise.all([
                    fetch(`/api/catalog/tours?destination_id=${hotel.destination_id}`).then(r => r.json()),
                    fetch(`/api/catalog/transfers?destination_id=${hotel.destination_id}`).then(r => r.json())
                ]).then(([tours, transfers]) => {
                    setExtras({
                        tours: Array.isArray(tours) ? tours : [],
                        transfers: Array.isArray(transfers) ? transfers : []
                    });
                });
            }
        }
    }, [formData.hotelId, formData.serviceType, hotels]);

    // Calculate price
    useEffect(() => {
        let total = 0;

        if (formData.serviceType === 'hotel' && formData.hotelId && formData.checkOut) {
            const hotel = hotels.find(h => h.id === Number(formData.hotelId));
            if (hotel) {
                const start = new Date(formData.checkIn).getTime();
                const end = new Date(formData.checkOut).getTime();
                const nights = Math.max(1, Math.ceil((end - start) / 86400000));

                const daily = (formData.adults * (Number(hotel.price) || 0)) +
                    (formData.children_4_10 * (Number(hotel.price_child) || 0)) +
                    (formData.children_0_3 * (Number(hotel.price_infant) || 0));
                total += daily * nights;
            }
        }

        const paying = formData.adults + formData.children_4_10;
        formData.selectedExtras.forEach(e => {
            total += (Number(e.price) || 0) * paying;
        });

        setTotalPrice(total);
    }, [formData, hotels]);

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                document_id: formData.documentId,
                user_email: formData.email,
                user_phone: formData.phone,
                hotel_id: formData.serviceType === 'hotel' ? Number(formData.hotelId) : null,
                check_in: formData.checkIn,
                check_out: formData.checkOut,
                adults: formData.adults,
                children_4_10: formData.children_4_10,
                children_0_3: formData.children_0_3,
                extra_services: formData.selectedExtras.map(e => ({ id: e.id, type: e.type }))
            };

            const res = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                alert('Error al procesar la cotización');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        }

        setIsLoading(false);
    };

    const toggleExtra = (item: any, type: string) => {
        const exists = formData.selectedExtras.find(e => e.id === item.id && e.type === type);
        if (exists) {
            setFormData(prev => ({
                ...prev,
                selectedExtras: prev.selectedExtras.filter(e => e !== exists)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                selectedExtras: [...prev.selectedExtras, { ...item, type }]
            }));
        }
    };

    const steps = [
        { number: 1, title: 'Servicio', icon: Hotel },
        { number: 2, title: 'Fechas', icon: Calendar },
        { number: 3, title: 'Extras', icon: Sparkles },
        { number: 4, title: 'Contacto', icon: User }
    ];

    if (submitted) {
        return (
            <div className={styles.container}>
                <motion.div
                    className={styles.successCard}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                >
                    <div className={styles.successIcon}>
                        <Check size={64} color="#10b981" />
                    </div>
                    <h1 className={styles.successTitle}>¡Cotización Enviada!</h1>
                    <p className={styles.successText}>
                        Hemos recibido tu solicitud. En breve recibirás un correo con los detalles de tu cotización.
                    </p>
                    <div className={styles.successPrice}>
                        <span className={styles.successPriceLabel}>Presupuesto Estimado</span>
                        <span className={styles.successPriceValue}>${totalPrice.toLocaleString()}</span>
                    </div>
                    <button
                        className={styles.successButton}
                        onClick={() => router.push('/')}
                    >
                        Volver al Inicio
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                {/* Progress Bar */}
                <div className={styles.progressSection}>
                    <div className={styles.progressBar}>
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;

                            return (
                                <React.Fragment key={step.number}>
                                    <div className={`${styles.progressStep} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                                        <div className={styles.progressStepIcon}>
                                            {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                                        </div>
                                        <span className={styles.progressStepLabel}>{step.title}</span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={`${styles.progressLine} ${isCompleted ? styles.completed : ''}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className={styles.content}>
                    <AnimatePresence mode="wait">
                        {/* STEP 1: Service Selection */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.stepContent}
                            >
                                <h2 className={styles.stepTitle}>¿Qué deseas cotizar?</h2>

                                <div className={styles.serviceTypeSelector}>
                                    <button
                                        className={`${styles.serviceTypeBtn} ${formData.serviceType === 'hotel' ? styles.active : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, serviceType: 'hotel' }))}
                                    >
                                        <Hotel size={32} />
                                        <span>Hotel / Alojamiento</span>
                                    </button>
                                    <button
                                        className={`${styles.serviceTypeBtn} ${formData.serviceType === 'tour' ? styles.active : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, serviceType: 'tour' }))}
                                    >
                                        <Compass size={32} />
                                        <span>Tour / Excursión</span>
                                    </button>
                                </div>

                                {formData.serviceType === 'hotel' && (
                                    <div className={styles.serviceGrid}>
                                        {hotels.map(hotel => (
                                            <div
                                                key={hotel.id}
                                                className={`${styles.serviceCard} ${formData.hotelId === hotel.id.toString() ? styles.selected : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, hotelId: hotel.id.toString() }))}
                                            >
                                                <img src={hotel.image} alt={hotel.name} className={styles.serviceCardImage} />
                                                <div className={styles.serviceCardContent}>
                                                    <h3 className={styles.serviceCardTitle}>{hotel.name}</h3>
                                                    <p className={styles.serviceCardLocation}>
                                                        <MapPin size={14} /> {hotel.location}
                                                    </p>
                                                    <p className={styles.serviceCardPrice}>Desde ${hotel.price}/noche</p>
                                                </div>
                                                {formData.hotelId === hotel.id.toString() && (
                                                    <div className={styles.serviceCardCheck}>
                                                        <Check size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {formData.serviceType === 'tour' && (
                                    <div className={styles.serviceGrid}>
                                        {tours.map(tour => (
                                            <div
                                                key={tour.id}
                                                className={`${styles.serviceCard} ${formData.tourId === tour.id.toString() ? styles.selected : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, tourId: tour.id.toString() }))}
                                            >
                                                <img src={tour.image} alt={tour.name} className={styles.serviceCardImage} />
                                                <div className={styles.serviceCardContent}>
                                                    <h3 className={styles.serviceCardTitle}>{tour.name}</h3>
                                                    <p className={styles.serviceCardLocation}>
                                                        <MapPin size={14} /> {tour.location}
                                                    </p>
                                                    <p className={styles.serviceCardPrice}>${tour.price}/persona</p>
                                                </div>
                                                {formData.tourId === tour.id.toString() && (
                                                    <div className={styles.serviceCardCheck}>
                                                        <Check size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 2: Dates & Guests */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.stepContent}
                            >
                                <h2 className={styles.stepTitle}>Fechas y Huéspedes</h2>

                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>
                                            <Calendar size={18} />
                                            Fecha de Llegada
                                        </label>
                                        <input
                                            type="date"
                                            className={styles.input}
                                            value={formData.checkIn}
                                            onChange={e => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>
                                            <Calendar size={18} />
                                            Fecha de Salida
                                        </label>
                                        <input
                                            type="date"
                                            className={styles.input}
                                            value={formData.checkOut}
                                            onChange={e => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.guestsSection}>
                                    <label className={styles.label}>
                                        <Users size={18} />
                                        Número de Huéspedes
                                    </label>

                                    <div className={styles.guestCounter}>
                                        <span className={styles.guestLabel}>Adultos (+12 años)</span>
                                        <div className={styles.counterControls}>
                                            <button
                                                type="button"
                                                className={styles.counterBtn}
                                                onClick={() => setFormData(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                                            >
                                                -
                                            </button>
                                            <span className={styles.counterValue}>{formData.adults}</span>
                                            <button
                                                type="button"
                                                className={styles.counterBtn}
                                                onClick={() => setFormData(prev => ({ ...prev, adults: prev.adults + 1 }))}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.guestCounter}>
                                        <span className={styles.guestLabel}>Niños (4-11 años)</span>
                                        <div className={styles.counterControls}>
                                            <button
                                                type="button"
                                                className={styles.counterBtn}
                                                onClick={() => setFormData(prev => ({ ...prev, children_4_10: Math.max(0, prev.children_4_10 - 1) }))}
                                            >
                                                -
                                            </button>
                                            <span className={styles.counterValue}>{formData.children_4_10}</span>
                                            <button
                                                type="button"
                                                className={styles.counterBtn}
                                                onClick={() => setFormData(prev => ({ ...prev, children_4_10: prev.children_4_10 + 1 }))}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.guestCounter}>
                                        <span className={styles.guestLabel}>Infantes (0-3 años)</span>
                                        <div className={styles.counterControls}>
                                            <button
                                                type="button"
                                                className={styles.counterBtn}
                                                onClick={() => setFormData(prev => ({ ...prev, children_0_3: Math.max(0, prev.children_0_3 - 1) }))}
                                            >
                                                -
                                            </button>
                                            <span className={styles.counterValue}>{formData.children_0_3}</span>
                                            <button
                                                type="button"
                                                className={styles.counterBtn}
                                                onClick={() => setFormData(prev => ({ ...prev, children_0_3: prev.children_0_3 + 1 }))}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Extras */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.stepContent}
                            >
                                <h2 className={styles.stepTitle}>Servicios Adicionales</h2>
                                <p className={styles.stepSubtitle}>Personaliza tu experiencia (opcional)</p>

                                {extras.transfers.length > 0 && (
                                    <div className={styles.extrasCategory}>
                                        <h3 className={styles.extrasCategoryTitle}>Traslados</h3>
                                        <div className={styles.extrasGrid}>
                                            {extras.transfers.map(transfer => (
                                                <div
                                                    key={transfer.id}
                                                    className={`${styles.extraCard} ${formData.selectedExtras.find(e => e.id === transfer.id && e.type === 'transfer') ? styles.selected : ''}`}
                                                    onClick={() => toggleExtra(transfer, 'transfer')}
                                                >
                                                    <h4 className={styles.extraCardTitle}>{transfer.name}</h4>
                                                    <p className={styles.extraCardPrice}>+${transfer.price}/persona</p>
                                                    {formData.selectedExtras.find(e => e.id === transfer.id && e.type === 'transfer') && (
                                                        <div className={styles.extraCardCheck}>
                                                            <Check size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {extras.tours.length > 0 && (
                                    <div className={styles.extrasCategory}>
                                        <h3 className={styles.extrasCategoryTitle}>Tours & Excursiones</h3>
                                        <div className={styles.extrasGrid}>
                                            {extras.tours.map(tour => (
                                                <div
                                                    key={tour.id}
                                                    className={`${styles.extraCard} ${formData.selectedExtras.find(e => e.id === tour.id && e.type === 'tour') ? styles.selected : ''}`}
                                                    onClick={() => toggleExtra(tour, 'tour')}
                                                >
                                                    <h4 className={styles.extraCardTitle}>{tour.name}</h4>
                                                    <p className={styles.extraCardPrice}>+${tour.price}/persona</p>
                                                    {formData.selectedExtras.find(e => e.id === tour.id && e.type === 'tour') && (
                                                        <div className={styles.extraCardCheck}>
                                                            <Check size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {extras.transfers.length === 0 && extras.tours.length === 0 && (
                                    <div className={styles.noExtras}>
                                        <Sparkles size={48} color="#94a3b8" />
                                        <p>No hay servicios adicionales disponibles para este destino</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 4: Contact Info */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.stepContent}
                            >
                                <h2 className={styles.stepTitle}>Información de Contacto</h2>

                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>
                                            <User size={18} />
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="Tu nombre"
                                            value={formData.firstName}
                                            onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>
                                            <User size={18} />
                                            Apellido
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="Tu apellido"
                                            value={formData.lastName}
                                            onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>
                                            <CreditCard size={18} />
                                            Cédula / Pasaporte
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="V-12345678"
                                            value={formData.documentId}
                                            onChange={e => setFormData(prev => ({ ...prev, documentId: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>
                                            <Phone size={18} />
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            className={styles.input}
                                            placeholder="+58 412 1234567"
                                            value={formData.phone}
                                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                                        <label className={styles.label}>
                                            <Mail size={18} />
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            className={styles.input}
                                            placeholder="correo@ejemplo.com"
                                            value={formData.email}
                                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer with Navigation & Price */}
                <div className={styles.footer}>
                    <div className={styles.footerLeft}>
                        {currentStep > 1 && (
                            <button className={styles.backBtn} onClick={handleBack}>
                                <ChevronLeft size={20} />
                                Atrás
                            </button>
                        )}
                    </div>

                    <div className={styles.footerCenter}>
                        <span className={styles.priceLabel}>Total Estimado</span>
                        <span className={styles.priceValue}>${totalPrice.toLocaleString()}</span>
                    </div>

                    <div className={styles.footerRight}>
                        {currentStep < 4 ? (
                            <button
                                className={styles.nextBtn}
                                onClick={handleNext}
                                disabled={
                                    (currentStep === 1 && !formData.hotelId && !formData.tourId) ||
                                    (currentStep === 2 && (!formData.checkIn || !formData.checkOut))
                                }
                            >
                                Siguiente
                                <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                className={styles.submitBtn}
                                onClick={handleSubmit}
                                disabled={isLoading || !formData.firstName || !formData.email || !formData.phone}
                            >
                                {isLoading ? 'Enviando...' : 'Enviar Cotización'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
