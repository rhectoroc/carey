'use client';

import React, { useState, useEffect } from 'react';
import styles from './quote.module.css';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';
import { Car, Compass, Calendar, Users, ArrowLeft } from 'lucide-react';
import { Service } from '@/data/mockServices';

interface QuoteFormProps {
    embedded?: boolean;
    preSelectedService?: Service | null;
    onBack?: () => void;
    onClose?: () => void;
}

export default function QuoteForm({ embedded = false, preSelectedService, onBack, onClose }: QuoteFormProps) {
    const searchParams = useSearchParams();
    const [hotels, setHotels] = useState<any[]>([]);

    // Extras State
    const [extras, setExtras] = useState<{ tours: any[], transfers: any[] }>({ tours: [], transfers: [] });
    const [showExtras, setShowExtras] = useState(false);
    const [selectedExtras, setSelectedExtras] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [quoteResult, setQuoteResult] = useState<any>(null);

    // Form inputs
    const [hotelId, setHotelId] = useState('');
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
    const [guests, setGuests] = useState({ adults: 2, child_4_10: 0, child_0_3: 0 });
    const [contact, setContact] = useState({
        firstName: '', lastName: '', documentId: '', email: '', phone: ''
    });

    // Pricing & Animation
    const [liveTotal, setLiveTotal] = useState(0);
    const priceControls = useAnimation();

    // Mode
    const [tourMode, setTourMode] = useState(false);
    const [tourName, setTourName] = useState('');

    // --- Data Fetching ---
    useEffect(() => {
        const initialize = async () => {
            // 1. Initial Dates
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayAfter = new Date();
            dayAfter.setDate(dayAfter.getDate() + 2);
            if (!dates.checkIn) {
                setDates({
                    checkIn: tomorrow.toISOString().split('T')[0],
                    checkOut: dayAfter.toISOString().split('T')[0]
                });
            }

            // 2. Logic based on input (Props vs URL)
            if (preSelectedService) {
                // Embedded Mode
                const cat = preSelectedService.category.toLowerCase();
                if (cat.includes('tour') || cat.includes('excursión')) {
                    setTourMode(true);
                    setTourName(preSelectedService.title);
                    // Use the service ID to fetch extensions if needed, or simply assume it's the base
                    // For now, we set the name.
                    // If we want extras, we need to treat it as a Tour.
                    setSelectedExtras([{
                        id: preSelectedService.id,
                        name: preSelectedService.title,
                        price: preSelectedService.price,
                        type: 'tour'
                    }]);
                } else {
                    // Hotel Mode
                    setHotelId(preSelectedService.id.toString());
                    // We need the list of hotels to render the select properly, or just set it
                    // Fetch hotels anyway to populate list
                    try {
                        const res = await fetch('/api/catalog/hotels');
                        const data = await res.json();
                        setHotels(data);
                    } catch (e) {
                        console.error(e);
                    }
                }
            } else {
                // Page Mode (URL params)
                const tourIdParam = searchParams.get('tour_id');
                const hotelIdParam = searchParams.get('hotel_id');

                if (tourIdParam) {
                    setTourMode(true);
                    setLoading(true);
                    fetch('/api/catalog/tours')
                        .then(r => r.json())
                        .then(allTours => {
                            const found = allTours.find((t: any) => t.id === Number(tourIdParam));
                            if (found) {
                                setTourName(found.name);
                                setSelectedExtras(prev => {
                                    if (prev.find(e => e.id === found.id && e.type === 'tour')) return prev;
                                    return [{ ...found, type: 'tour' }];
                                });
                            }
                            setLoading(false);
                        })
                        .catch(() => setLoading(false));
                } else {
                    if (hotelIdParam) setHotelId(hotelIdParam);

                    fetch('/api/catalog/hotels')
                        .then(res => res.json())
                        .then(data => setHotels(data))
                        .catch(err => console.error(err));
                }
            }
        };

        initialize();
    }, [searchParams, preSelectedService]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch Linked Extras
    useEffect(() => {
        if (tourMode || !hotelId) {
            if (!tourMode) {
                setExtras({ tours: [], transfers: [] });
                // We keep liveTotal update logic in the other effect
            }
            return;
        }

        // Only fetch extras if we have a hotel selected
        // We find the hotel in the list to get 'destination_id'
        // If preSelectedService is a hotel, we use that.
        const currentHotel = hotels.find(h => h.id === Number(hotelId)) || (preSelectedService?.category.toLowerCase().includes('hotel') ? preSelectedService : null);

        // Note: preSelectedService might not have destination_id property if it's from mockServices vs API
        // But let's assume API consistency
        // If we fetched 'hotels', we have destination_id.

        if (currentHotel && (currentHotel as any).destination_id) {
            Promise.all([
                fetch(`/api/catalog/tours?destination_id=${(currentHotel as any).destination_id}`).then(r => r.json()),
                fetch(`/api/catalog/transfers?destination_id=${(currentHotel as any).destination_id}`).then(r => r.json())
            ]).then(([tours, transfers]) => {
                setExtras({ tours: Array.isArray(tours) ? tours : [], transfers: Array.isArray(transfers) ? transfers : [] });
            });
        }
    }, [hotelId, hotels, tourMode, preSelectedService]);

    // Calculate Price
    useEffect(() => {
        if (!dates.checkIn) return;
        let total = 0;

        if (!tourMode && hotelId && dates.checkOut) {
            const h = hotels.find(x => x.id === Number(hotelId));
            // If using preSelectedService, use its price if hotel not found in list (e.g. detailed list not loaded)
            const basePrice = h ? (Number(h.price) || 0) : (preSelectedService && !tourMode ? Number(preSelectedService.price) : 0);
            const childPrice = h ? (Number(h.price_child) || 0) : 0; // Simplified fallback
            const infantPrice = h ? (Number(h.price_infant) || 0) : 0;

            if (basePrice > 0) {
                const start = new Date(dates.checkIn).getTime();
                const end = new Date(dates.checkOut).getTime();
                const nights = Math.max(1, Math.ceil((end - start) / (86400000)));

                const daily = (guests.adults * basePrice) +
                    (guests.child_4_10 * childPrice) +
                    (guests.child_0_3 * infantPrice);
                total += daily * nights;
            }
        }

        const paying = guests.adults + guests.child_4_10;
        selectedExtras.forEach(e => {
            total += (Number(e.price) || 0) * paying;
        });

        setLiveTotal(total);
    }, [hotelId, dates, guests, selectedExtras, hotels, tourMode, preSelectedService]);

    // Price Bounce Effect
    useEffect(() => {
        if (liveTotal > 0) {
            priceControls.start({
                scale: [1, 1.25, 1],
                color: ["#1F6D8C", "#C5A059", "#1F6D8C"],
                transition: { duration: 0.4 }
            });
        }
    }, [liveTotal, priceControls]);

    const handleGuestChange = (type: keyof typeof guests, delta: number) => {
        setGuests(prev => {
            const val = prev[type] + delta;
            if (type === 'adults' && val < 1) return prev;
            if (val < 0) return prev;
            return { ...prev, [type]: val };
        });
    };

    const toggleExtra = (item: any, type: string) => {
        const exists = selectedExtras.find(e => e.id === item.id && e.type === type);
        if (exists) setSelectedExtras(prev => prev.filter(e => e !== exists));
        else setSelectedExtras(prev => [...prev, { ...item, type }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                first_name: contact.firstName,
                last_name: contact.lastName,
                document_id: contact.documentId,
                user_email: contact.email,
                user_phone: contact.phone,
                hotel_id: tourMode ? null : Number(hotelId),
                check_in: dates.checkIn,
                check_out: dates.checkOut,
                adults: guests.adults,
                children_4_10: guests.child_4_10,
                children_0_3: guests.child_0_3,
                extra_services: selectedExtras.map(e => ({ id: e.id, type: e.type }))
            };
            const res = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                setQuoteResult(data);
                setSubmitted(true);
            } else { setError('Error al procesar.'); }
        } catch (e) { setError('Error de conexión'); }
        setLoading(false);
    };

    const selectedHotel = hotels.find(h => h.id === Number(hotelId)) || (preSelectedService && !tourMode ? preSelectedService : null);
    const title = tourMode ? tourName : (selectedHotel?.title || selectedHotel?.name || 'Inicia tu Cotización');
    const location = selectedHotel?.location || (tourMode ? 'Venezuela' : '');
    const bgImage = selectedHotel?.image || '/images/hero-bg.jpg';

    // Animation Variants
    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.6 } }
    };

    // Marquee content
    const marqueeText = `✨ ¡Personaliza tu viaje! Añade traslados privados y tours exclusivos en ${location || "tu destino"}... Haz clic aquí para ver opciones ✨`;


    if (submitted) {
        const successContent = (
            <div style={{ textAlign: 'center' }}>
                <h2 className={styles.title}>¡Solicitud Recibida!</h2>
                <p className={styles.subtitle}>En breve recibirás tu cotización detallada.</p>
                <div style={{ margin: '2rem 0' }}>
                    <div className={styles.priceLabel}>Presupuesto Estimado</div>
                    <div className={styles.totalPrice} style={{ fontSize: '2.5rem', color: '#C5A059' }}>
                        ${Number(quoteResult?.total_price).toLocaleString()}
                    </div>
                </div>
                <button onClick={() => { setSubmitted(false); setQuoteResult(null); }} className={styles.submitBtn}>
                    Nueva Cotización
                </button>
            </div>
        );

        if (embedded) return <div className={styles.embeddedWrapper} style={{ padding: '20px' }}>{successContent}</div>;

        return (
            <div className={styles.container} style={{ backgroundImage: `url(${bgImage})` }}>
                <motion.div className={styles.modal} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    {successContent}
                </motion.div>
            </div>
        );
    }

    const content = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {!embedded && (
                <div style={{ position: 'absolute', top: 20, left: 20, cursor: 'pointer', zIndex: 20 }} onClick={() => onBack ? onBack() : window.history.back()}>
                    <ArrowLeft size={24} color="#64748b" />
                </div>
            )}

            <div className={styles.header} style={{ marginBottom: '1.5rem', marginTop: embedded ? 0 : '2rem' }}>
                {embedded && onBack && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }} onClick={onBack}>
                        <ArrowLeft size={20} color="#64748b" />
                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Volver a detalles</span>
                    </div>
                )}
                <h1 className={styles.title} style={{ fontSize: embedded ? '1.5rem' : '1.8rem', textAlign: 'left' }}>{title}</h1>
                {location && <div className={styles.subtitle} style={{ textAlign: 'left' }}>📍 {location}</div>}
            </div>

            <form id="quoteForm" onSubmit={handleSubmit} className={styles.grid} style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>

                {/* Hotel Selector (only if not preselected/tour mode) */}
                {(!tourMode && !preSelectedService) && (
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Hotel / Alojamiento</label>
                        <select className={styles.select} value={hotelId} onChange={e => setHotelId(e.target.value)} required>
                            <option value="">Selecciona un Hotel</option>
                            {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                    </div>
                )}

                {/* DATES - 2 Cols */}
                <div className={styles.row}>
                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                        <label className={styles.label}>Llegada</label>
                        <input type="date" className={styles.input} value={dates.checkIn} onChange={e => setDates({ ...dates, checkIn: e.target.value })} required />
                    </div>
                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                        <label className={styles.label}>Salida</label>
                        <input type="date" className={styles.input} value={dates.checkOut} onChange={e => setDates({ ...dates, checkOut: e.target.value })} required />
                    </div>
                </div>

                {/* GUESTS */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Huéspedes</label>
                    <div className={styles.guestRow}>
                        <span>Adultos (+12)</span>
                        <div className={styles.counter}>
                            <button type="button" className={styles.counterBtn} onClick={() => handleGuestChange('adults', -1)}>-</button>
                            <span>{guests.adults}</span>
                            <button type="button" className={styles.counterBtn} onClick={() => handleGuestChange('adults', 1)}>+</button>
                        </div>
                    </div>
                    <div className={styles.guestRow}>
                        <span>Niños (4-11)</span>
                        <div className={styles.counter}>
                            <button type="button" className={styles.counterBtn} onClick={() => handleGuestChange('child_4_10', -1)}>-</button>
                            <span>{guests.child_4_10}</span>
                            <button type="button" className={styles.counterBtn} onClick={() => handleGuestChange('child_4_10', 1)}>+</button>
                        </div>
                    </div>
                    <div className={styles.guestRow}>
                        <span>Infantes (0-3)</span>
                        <div className={styles.counter}>
                            <button type="button" className={styles.counterBtn} onClick={() => handleGuestChange('child_0_3', -1)}>-</button>
                            <span>{guests.child_0_3}</span>
                            <button type="button" className={styles.counterBtn} onClick={() => handleGuestChange('child_0_3', 1)}>+</button>
                        </div>
                    </div>
                </div>

                {/* EXTRAS */}
                {(extras.transfers.length > 0 || extras.tours.length > 0) && (
                    <div style={{ margin: '1rem 0' }}>
                        <div className={styles.marqueeSection} onClick={() => setShowExtras(!showExtras)} style={{ margin: '0 -10px', borderRadius: 12 }}>
                            {!showExtras ? (
                                <motion.div
                                    className={styles.marqueeTrack}
                                    animate={{ x: [0, -500] }}
                                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                >
                                    {[1, 2, 3].map(i => (
                                        <span key={i} className={styles.marqueeText}>
                                            {marqueeText}
                                        </span>
                                    ))}
                                </motion.div>
                            ) : (
                                <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#C5A059', fontWeight: 600 }}>
                                    👆 Ocultar opciones
                                </div>
                            )}
                        </div>

                        <AnimatePresence>
                            {showExtras && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={styles.extrasList}>
                                        {extras.transfers.length > 0 && (
                                            <>
                                                <div className={styles.extrasGroupTitle}>TRASLADOS</div>
                                                {extras.transfers.map(t => (
                                                    <div key={t.id}
                                                        className={`${styles.extrasListItem} ${selectedExtras.find(e => e.id === t.id && e.type === 'transfer') ? styles.selected : ''}`}
                                                        onClick={() => toggleExtra(t, 'transfer')}
                                                    >
                                                        <div className={styles.extrasItemInfo}>
                                                            <Car size={18} color={selectedExtras.find(e => e.id === t.id && e.type === 'transfer') ? "#C5A059" : "#64748b"} />
                                                            <span>{t.name}</span>
                                                        </div>
                                                        <div className={styles.extrasItemPrice}>+${t.price}</div>
                                                    </div>
                                                ))}
                                            </>
                                        )}

                                        {extras.tours.length > 0 && (
                                            <>
                                                <div className={styles.extrasGroupTitle}>TOURS & EXCURSIONES</div>
                                                {extras.tours.map(t => (
                                                    <div key={t.id}
                                                        className={`${styles.extrasListItem} ${selectedExtras.find(e => e.id === t.id && e.type === 'tour') ? styles.selected : ''}`}
                                                        onClick={() => toggleExtra(t, 'tour')}
                                                    >
                                                        <div className={styles.extrasItemInfo}>
                                                            <Compass size={18} color="#1F6D8C" />
                                                            <span>{t.name}</span>
                                                        </div>
                                                        <div className={styles.extrasItemPrice}>+${t.price}</div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* CONTACT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className={styles.row}>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Nombre</label>
                            <input className={styles.input} placeholder="Tu Nombre" value={contact.firstName} onChange={e => setContact({ ...contact, firstName: e.target.value })} required />
                        </div>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Apellido</label>
                            <input className={styles.input} placeholder="Tu Apellido" value={contact.lastName} onChange={e => setContact({ ...contact, lastName: e.target.value })} required />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Cédula / Pasaporte</label>
                            <input className={styles.input} placeholder="ID Documento" value={contact.documentId} onChange={e => setContact({ ...contact, documentId: e.target.value })} required />
                        </div>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Teléfono</label>
                            <input className={styles.input} placeholder="+58..." type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} required />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input className={styles.input} placeholder="correo@ejemplo.com" type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} required />
                    </div>
                </div>

            </form>

            <div className={styles.footer}>
                <div>
                    <div className={styles.priceLabel}>Total Estimado</div>
                    <motion.div
                        className={styles.totalPrice}
                        animate={priceControls}
                    >
                        ${Math.round(liveTotal).toLocaleString()}
                    </motion.div>
                </div>
                <button type="submit" form="quoteForm" className={styles.submitBtn} disabled={loading}>
                    {loading ? '...' : 'COTIZAR AHORA'}
                </button>
            </div>

        </div>
    );

    if (embedded) {
        return <div className={styles.embeddedWrapper}>{content}</div>;
    }

    return (
        <div className={styles.container} style={{ backgroundImage: `url(${bgImage})` }}>
            <motion.div
                className={styles.modal}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
            >
                {content}
            </motion.div>
        </div>
    );
}
