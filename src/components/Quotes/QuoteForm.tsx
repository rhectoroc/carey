'use client';

import React, { useState, useEffect } from 'react';
import styles from './quote.module.css';
import { useSearchParams } from 'next/navigation';

export default function QuoteForm() {
    const searchParams = useSearchParams();
    const [hotels, setHotels] = useState<any[]>([]);
    const [extras, setExtras] = useState<{ tours: any[], transfers: any[] }>({ tours: [], transfers: [] });
    const [selectedExtras, setSelectedExtras] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [quoteResult, setQuoteResult] = useState<any>(null);

    // Form State
    const [hotelId, setHotelId] = useState(searchParams.get('hotel_id') || '');
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
    const [guests, setGuests] = useState({ adults: 2, child_4_10: 0, child_0_3: 0 });
    // Updated Contact State
    const [contact, setContact] = useState({
        firstName: '',
        lastName: '',
        documentId: '',
        email: '',
        phone: ''
    });

    // Live Price State
    const [liveTotal, setLiveTotal] = useState(0);

    // Tour Mode State
    const [tourMode, setTourMode] = useState(false);
    const [tourName, setTourName] = useState('');


    // Initial Load: Check for tour_id or hotel_id
    useEffect(() => {
        const tourIdParam = searchParams.get('tour_id');
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
            // Normal Hotel Mode
            fetch('/api/catalog/hotels')
                .then(res => res.json())
                .then(data => setHotels(data))
                .catch(err => console.error('Error fetching hotels:', err));
        }

        // Set Default Dates
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);

        setDates({
            checkIn: tomorrow.toISOString().split('T')[0],
            checkOut: dayAfter.toISOString().split('T')[0]
        });

    }, [searchParams]);

    // Fetch Extras & Calculate Price when Hotel or Dependencies Change
    useEffect(() => {
        if (tourMode || !hotelId) {
            if (!tourMode) {
                setExtras({ tours: [], transfers: [] });
                setLiveTotal(0);
            }
            return;
        }

        const selectedHotel = hotels.find(h => h.id === Number(hotelId));
        if (selectedHotel && selectedHotel.destination_id) {
            // Fetch Extras for this destination
            Promise.all([
                fetch(`/api/catalog/tours?destination_id=${selectedHotel.destination_id}`).then(r => r.json()),
                fetch(`/api/catalog/transfers?destination_id=${selectedHotel.destination_id}`).then(r => r.json())
            ]).then(([tours, transfers]) => {
                setExtras({ tours: Array.isArray(tours) ? tours : [], transfers: Array.isArray(transfers) ? transfers : [] });
            });
        }
    }, [hotelId, hotels, tourMode]);

    // Calculate Live Price
    useEffect(() => {
        if (!dates.checkIn) return;

        let totalAccommodation = 0;

        if (!tourMode && hotelId && dates.checkOut) {
            const selectedHotel = hotels.find(h => h.id === Number(hotelId));
            if (selectedHotel) {
                const checkInDate = new Date(dates.checkIn);
                const checkOutDate = new Date(dates.checkOut);
                const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

                if (nights >= 1) {
                    const p_adult = Number(selectedHotel.price || 0);
                    const p_child = Number(selectedHotel.price_child || 0);
                    const p_infant = Number(selectedHotel.price_infant || 0);
                    const dailyRate = (guests.adults * p_adult) + (guests.child_4_10 * p_child) + (guests.child_0_3 * p_infant);
                    totalAccommodation = dailyRate * nights;
                }
            }
        }

        // 2. Extras
        let totalExtras = 0;
        const payingPassengers = guests.adults + guests.child_4_10; // Assuming infants don't pay for tours/transfers mainly or handled separately. For MVP, strict sum.

        selectedExtras.forEach(extra => {
            totalExtras += (Number(extra.price) * payingPassengers);
        });

        setLiveTotal(totalAccommodation + totalExtras);

    }, [hotelId, dates, guests, selectedExtras, hotels, tourMode]);


    const handleGuestChange = (type: 'adults' | 'child_4_10' | 'child_0_3', delta: number) => {
        setGuests(prev => {
            const newVal = prev[type] + delta;
            if (type === 'adults' && newVal < 1) return prev;
            if (newVal < 0) return prev;
            return { ...prev, [type]: newVal };
        });
    };

    const toggleExtra = (item: any, type: 'tour' | 'transfer') => {
        const exists = selectedExtras.find(e => e.id === item.id && e.type === type);
        if (exists) {
            setSelectedExtras(prev => prev.filter(e => !(e.id === item.id && e.type === type)));
        } else {
            setSelectedExtras(prev => [...prev, { ...item, type }]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!tourMode && !hotelId) {
            setError('Por favor selecciona un hotel.');
            setLoading(false);
            return;
        }

        if (selectedExtras.length === 0 && !hotelId) {
            setError('Debes seleccionar al menos un servicio.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                // Split Name and Doc ID
                first_name: contact.firstName,
                last_name: contact.lastName,
                document_id: contact.documentId,
                user_email: contact.email,
                user_phone: contact.phone,

                hotel_id: tourMode ? null : Number(hotelId),
                check_in: dates.checkIn,
                check_out: tourMode ? dates.checkIn : dates.checkOut,
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
            } else {
                const errData = await res.json();
                setError(errData.error || 'Error al procesar la cotización.');
            }
        } catch (err) {
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Animated Price Hook
    const [animatedPrice, setAnimatedPrice] = useState(0);

    useEffect(() => {
        const duration = 500; // ms
        const steps = 20;
        const stepTime = duration / steps;
        const start = animatedPrice;
        const end = liveTotal;
        const increment = (end - start) / steps;

        let current = start;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current += increment;
            if (step >= steps) {
                setAnimatedPrice(end);
                clearInterval(timer);
            } else {
                setAnimatedPrice(current);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [liveTotal]);


    const selectedHotel = hotels.find(h => h.id === Number(hotelId));
    const serviceTitle = tourMode ? tourName : (selectedHotel?.name || 'Selecciona un Servicio');
    const serviceImage = selectedHotel?.image || (tourMode ? '/images/tour-placeholder.jpg' : '');

    // Background Image Logic
    const bgImage = serviceImage || 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2049&auto=format&fit=crop';

    if (submitted) {
        return (
            <div className={styles.splitContainer}>
                <div className={styles.leftPanel}>
                    <img src={bgImage} alt="Success" className={styles.leftContextImage} />
                    <div className={styles.leftContentOverlay}>
                        <h2 className={styles.serviceTitle}>¡Todo Listo!</h2>
                        <div className={styles.serviceMeta}>Revisa tu correo</div>
                    </div>
                </div>
                <div className={styles.rightPanel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={styles.successCard}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✓</div>
                        <h2 className={styles.mainHeading}>Cotización Enviada</h2>
                        <p style={{ color: '#6b7280', marginBottom: '30px' }}>
                            Hola <b>{contact.firstName}</b>, hemos recibido tu solicitud para <b>{serviceTitle}</b>.
                            Tu presupuesto estimado es de <b style={{ color: '#000' }}>${Number(quoteResult?.total_price).toLocaleString()}</b>.
                        </p>
                        <button
                            onClick={() => { setSubmitted(false); setQuoteResult(null); setLiveTotal(0); }}
                            className={styles.submitButton}
                            style={{ background: 'white', color: '#000', border: '1px solid #e5e7eb' }}
                        >
                            Nueva Cotización
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.splitContainer}>
            {/* LEFT PANEL: Context & Visuals */}
            <div className={styles.leftPanel}>
                <button onClick={() => window.history.back()} className={styles.backButton}>←</button>
                <img src={bgImage} alt={serviceTitle} className={styles.leftContextImage} />
                <div className={styles.leftContentOverlay}>
                    <h2 className={styles.serviceTitle}>{serviceTitle}</h2>
                    <div className={styles.serviceMeta}>
                        {selectedHotel?.stars && <span>⭐ {selectedHotel.stars} Estrellas</span>}
                        <span>📍 {selectedHotel?.location || (tourMode ? 'Tour / Actividad' : 'Destino')}</span>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Form */}
            <div className={styles.rightPanel}>
                <div className={styles.formHeader}>
                    <h1 className={styles.mainHeading}>Personaliza tu Experiencia</h1>
                    <p className={styles.subHeading}>Completa los detalles para recibir tu presupuesto al instante.</p>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

                <form id="quote-form" onSubmit={handleSubmit}>
                    {/* 1. Dates */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>Fechas y Destino</div>
                        {!tourMode && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Hotel Preferido</label>
                                <select
                                    className={styles.select}
                                    value={hotelId}
                                    onChange={(e) => { setHotelId(e.target.value); setSelectedExtras([]); }}
                                    required
                                >
                                    <option value="">-- Selecciona una opción --</option>
                                    {hotels.map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>{tourMode ? 'Fecha' : 'Llegada'}</label>
                                <input type="date" className={styles.input} value={dates.checkIn} onChange={(e) => setDates({ ...dates, checkIn: e.target.value, checkOut: tourMode ? e.target.value : dates.checkOut })} required />
                            </div>
                            {!tourMode && (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Salida</label>
                                    <input type="date" className={styles.input} value={dates.checkOut} onChange={(e) => setDates({ ...dates, checkOut: e.target.value })} required />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Guests */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>Pasajeros</div>
                        <div className={styles.counterContainer}>
                            <span className={styles.label}>Adultos (+12)</span>
                            <div className={styles.counterControls}>
                                <button type="button" className={styles.counterButton} onClick={() => handleGuestChange('adults', -1)}>-</button>
                                <span className={styles.value}>{guests.adults}</span>
                                <button type="button" className={styles.counterButton} onClick={() => handleGuestChange('adults', 1)}>+</button>
                            </div>
                        </div>
                        <div className={styles.counterContainer}>
                            <span className={styles.label}>Niños (4-10)</span>
                            <div className={styles.counterControls}>
                                <button type="button" className={styles.counterButton} onClick={() => handleGuestChange('child_4_10', -1)}>-</button>
                                <span className={styles.value}>{guests.child_4_10}</span>
                                <button type="button" className={styles.counterButton} onClick={() => handleGuestChange('child_4_10', 1)}>+</button>
                            </div>
                        </div>
                        <div className={styles.counterContainer}>
                            <span className={styles.label}>Bebés (0-3)</span>
                            <div className={styles.counterControls}>
                                <button type="button" className={styles.counterButton} onClick={() => handleGuestChange('child_0_3', -1)}>-</button>
                                <span className={styles.value}>{guests.child_0_3}</span>
                                <button type="button" className={styles.counterButton} onClick={() => handleGuestChange('child_0_3', 1)}>+</button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Extras */}
                    {(extras.tours.length > 0 || extras.transfers.length > 0) && (
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Complementos</div>
                            {extras.transfers.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label className={styles.label} style={{ marginBottom: '10px' }}>Traslados</label>
                                    <div className={styles.extrasGrid}>
                                        {extras.transfers.map((t: any) => (
                                            <div key={t.id} className={`${styles.extraCard} ${selectedExtras.find(e => e.id === t.id && e.type === 'transfer') ? styles.selected : ''}`} onClick={() => toggleExtra(t, 'transfer')}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>+${t.price} pp</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {extras.tours.length > 0 && (
                                <div>
                                    <label className={styles.label} style={{ marginBottom: '10px' }}>Tours</label>
                                    <div className={styles.extrasGrid}>
                                        {extras.tours.map((t: any) => (
                                            <div key={t.id} className={`${styles.extraCard} ${selectedExtras.find(e => e.id === t.id && e.type === 'tour') ? styles.selected : ''}`} onClick={() => toggleExtra(t, 'tour')}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>+${t.price} pp</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. Contact */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>Datos Personales</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nombre</label>
                                <input className={styles.input} value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Apellido</label>
                                <input className={styles.input} value={contact.lastName} onChange={(e) => setContact({ ...contact, lastName: e.target.value })} required />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Documento (ID)</label>
                            <input className={styles.input} value={contact.documentId} onChange={(e) => setContact({ ...contact, documentId: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input type="email" className={styles.input} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Teléfono</label>
                            <input type="tel" className={styles.input} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                        </div>
                    </div>
                </form>
            </div>

            {/* Sticky Footer Total */}
            <div className={styles.stickyFooter}>
                <div>
                    <span className={styles.totalLabel}>Total Estimado</span>
                    <span className={styles.totalValue}>${Math.round(animatedPrice).toLocaleString()}</span>
                </div>
                <button type="submit" form="quote-form" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Procesando...' : 'COTIZAR AHORA'}
                </button>
            </div>
        </div>
    );
}
