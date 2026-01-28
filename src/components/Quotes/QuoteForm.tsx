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

            if (preSelectedService) {
                const cat = preSelectedService.category.toLowerCase();
                if (cat.includes('tour') || cat.includes('excursión')) {
                    setTourMode(true);
                    setTourName(preSelectedService.title);
                    setSelectedExtras([{
                        id: preSelectedService.id,
                        name: preSelectedService.title,
                        price: preSelectedService.price,
                        type: 'tour'
                    }]);
                } else {
                    setHotelId(preSelectedService.id.toString());
                    try {
                        const res = await fetch('/api/catalog/hotels');
                        const data = await res.json();
                        setHotels(data);
                    } catch (e) {
                        console.error(e);
                    }
                }
            } else {
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
            }
            return;
        }

        const currentHotel = hotels.find(h => h.id === Number(hotelId)) || (preSelectedService?.category.toLowerCase().includes('hotel') ? preSelectedService : null);

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
            const basePrice = h ? (Number(h.price) || 0) : (preSelectedService && !tourMode ? Number(preSelectedService.price) : 0);
            const childPrice = h ? (Number(h.price_child) || 0) : 0;
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

    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.6 } }
    };

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

    // COMPACT EMBEDDED LAYOUT
    const compactContent = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem' }}>
            {/* HEADER - Ultra Compact */}
            <div style={{ marginBottom: '0.5rem' }}>
                {onBack && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }} onClick={onBack}>
                        <ArrowLeft size={16} color="#64748b" />
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Volver</span>
                    </div>
                )}
                <h1 style={{
                    fontSize: '1.2rem',
                    margin: 0,
                    fontWeight: 800,
                    color: '#1e293b',
                    lineHeight: 1.2
                }}>{title}</h1>
                {location && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>📍 {location}</div>}
            </div>

            {/* FORM - Inline Styles for Compact */}
            <form id="quoteForm" onSubmit={handleSubmit} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>

                {/* DATES */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '0.5rem 0.7rem', border: '1px solid rgba(255,255,255,0.5)' }}>
                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Llegada</label>
                        <input type="date" style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: '#334155', outline: 'none' }} value={dates.checkIn} onChange={e => setDates({ ...dates, checkIn: e.target.value })} required />
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '0.5rem 0.7rem', border: '1px solid rgba(255,255,255,0.5)' }}>
                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Salida</label>
                        <input type="date" style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: '#334155', outline: 'none' }} value={dates.checkOut} onChange={e => setDates({ ...dates, checkOut: e.target.value })} required />
                    </div>
                </div>

                {/* GUESTS - Horizontal Compact */}
                <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '0.5rem 0.7rem', border: '1px solid rgba(255,255,255,0.5)' }}>
                    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Huéspedes</label>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Adultos</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '2px', borderRadius: '50px' }}>
                                <button type="button" style={{ width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: '#f1f5f9', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleGuestChange('adults', -1)}>-</button>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{guests.adults}</span>
                                <button type="button" style={{ width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: '#f1f5f9', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleGuestChange('adults', 1)}>+</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Niños</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '2px', borderRadius: '50px' }}>
                                <button type="button" style={{ width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: '#f1f5f9', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleGuestChange('child_4_10', -1)}>-</button>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{guests.child_4_10}</span>
                                <button type="button" style={{ width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: '#f1f5f9', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleGuestChange('child_4_10', 1)}>+</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Bebés</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '2px', borderRadius: '50px' }}>
                                <button type="button" style={{ width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: '#f1f5f9', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleGuestChange('child_0_3', -1)}>-</button>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{guests.child_0_3}</span>
                                <button type="button" style={{ width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: '#f1f5f9', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleGuestChange('child_0_3', 1)}>+</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTACT - 2x2 Grid */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '0.5rem 0.7rem', border: '1px solid rgba(255,255,255,0.5)' }}>
                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Nombre</label>
                        <input style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: '#334155', outline: 'none' }} placeholder="Nombre" value={contact.firstName} onChange={e => setContact({ ...contact, firstName: e.target.value })} required />
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '0.5rem 0.7rem', border: '1px solid rgba(255,255,255,0.5)' }}>
                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Apellido</label>
                        <input style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: '#334155', outline: 'none' }} placeholder="Apellido" value={contact.lastName} onChange={e => setContact({ ...contact, lastName: e.target.value })} required />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '0.5rem 0.7rem', border: '1px solid rgba(255,255,255,0.5)' }}>
                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Documento</label>
                        <input style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: '#334155', outline: 'none' }} placeholder="V-12345678" value={contact.documentId} onChange={e => setContact({ ...contact, documentId: e.target.value })} required />
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '0.5rem 0.7rem', border: '1px solid rgba(255,255,255,0.5)' }}>
                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Teléfono</label>
                        <input style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: '#334155', outline: 'none' }} placeholder="+58..." type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} required />
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '0.5rem 0.7rem', border: '1px solid rgba(255,255,255,0.5)' }}>
                    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email</label>
                    <input style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: '#334155', outline: 'none' }} placeholder="correo@ejemplo.com" type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} required />
                </div>

            </form>

            {/* FOOTER - Ultra Compact */}
            <div style={{
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'white',
                padding: '0.5rem 0.8rem',
                borderRadius: '14px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
                <div>
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
                    <motion.div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1F6D8C' }} animate={priceControls}>
                        ${Math.round(liveTotal).toLocaleString()}
                    </motion.div>
                </div>
                <button type="submit" form="quoteForm" style={{
                    background: '#1F6D8C',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '50px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(31, 109, 140, 0.3)'
                }} disabled={loading}>
                    {loading ? '...' : 'COTIZAR'}
                </button>
            </div>
        </div>
    );

    if (embedded) {
        return <div className={styles.embeddedWrapper}>{compactContent}</div>;
    }

    // STANDARD FULL PAGE VERSION
    return (
        <div className={styles.container} style={{ backgroundImage: `url(${bgImage})` }}>
            <motion.div
                className={styles.modal}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ position: 'absolute', top: 20, left: 20, cursor: 'pointer', zIndex: 20 }} onClick={() => onBack ? onBack() : window.history.back()}>
                        <ArrowLeft size={24} color="#64748b" />
                    </div>

                    <div className={styles.header}>
                        <h1 className={styles.title}>{title}</h1>
                        {location && <div className={styles.subtitle}>📍 {location}</div>}
                    </div>

                    <form id="quoteFormFull" onSubmit={handleSubmit} className={styles.grid}>
                        {(!tourMode && !preSelectedService) && (
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Hotel / Alojamiento</label>
                                <select className={styles.select} value={hotelId} onChange={e => setHotelId(e.target.value)} required>
                                    <option value="">Selecciona un Hotel</option>
                                    {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <div className={styles.row}>
                                <div style={{ flex: 1 }}>
                                    <label className={styles.label}>Llegada</label>
                                    <input type="date" className={styles.input} value={dates.checkIn} onChange={e => setDates({ ...dates, checkIn: e.target.value })} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className={styles.label}>Salida</label>
                                    <input type="date" className={styles.input} value={dates.checkOut} onChange={e => setDates({ ...dates, checkOut: e.target.value })} required />
                                </div>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Huéspedes</label>
                            <div className={styles.guestRow}>
                                <span>Adultos</span>
                                <div className={styles.counter}>
                                    <button type="button" className={styles.counterBtn} onClick={() => handleGuestChange('adults', -1)}>-</button>
                                    <span>{guests.adults}</span>
                                    <button type="button" className={styles.counterBtn} onClick={() => handleGuestChange('adults', 1)}>+</button>
                                </div>
                            </div>
                            <div className={styles.guestRow}>
                                <span>Niños (4-10)</span>
                                <div className={styles.counter}>
                                    <button type="button" className={styles.counterBtn} onClick={() => handleGuestChange('child_4_10', -1)}>-</button>
                                    <span>{guests.child_4_10}</span>
                                    <button type="button" className={styles.counterBtn} onClick={() => handleGuestChange('child_4_10', 1)}>+</button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Datos de Contacto</label>
                            <div className={styles.row}>
                                <input className={styles.input} placeholder="Tu Nombre" value={contact.firstName} onChange={e => setContact({ ...contact, firstName: e.target.value })} required />
                                <input className={styles.input} placeholder="Teléfono" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} required />
                            </div>
                            <input style={{ marginTop: 10 }} className={styles.input} placeholder="Correo Electrónico" type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} required />
                        </div>
                    </form>

                    <div className={styles.footer}>
                        <div>
                            <div className={styles.priceLabel}>Total Estimado</div>
                            <motion.div className={styles.totalPrice} animate={priceControls}>
                                ${Math.round(liveTotal).toLocaleString()}
                            </motion.div>
                        </div>
                        <button type="submit" form="quoteFormFull" className={styles.submitBtn} disabled={loading}>
                            {loading ? '...' : 'COTIZAR AHORA'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
