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
    // If hotel selected -> Use hotel image
    // If not, generic elegant travel background
    const bgImage = serviceImage || 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2049&auto=format&fit=crop';

    return (
        <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
            {/* Immersive Background */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(8px)',
                zIndex: 0,
                transform: 'scale(1.1)' // Prevent blur edge artifacts
            }} />
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.4)', // Dark Overlay
                zIndex: 1
            }} />

            <div className={styles.quoteLayout} style={{ position: 'relative', zIndex: 10 }}>
                {/* Column 1: Context */}
                <div className={styles.contextColumn}>
                    {selectedHotel && selectedHotel.image_url && (
                        <img src={selectedHotel.image_url} alt={serviceTitle} className={styles.contextImage} />
                    )}
                    {/* Fallback or Tour Image logic could go here */}

                    <h2 className={styles.contextTitle}>{serviceTitle}</h2>
                    <div className={styles.contextMeta}>
                        📍 {selectedHotel?.location || (tourMode ? 'Tour / Actividad' : 'Destino')}
                    </div>
                    {selectedHotel?.stars && (
                        <div className={styles.contextMeta}>
                            ⭐ {selectedHotel.stars} Estrellas
                        </div>
                    )}
                    <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666', lineHeight: '1.4' }}>
                        {selectedHotel?.description?.substring(0, 100)}...
                    </div>
                </div>

                {/* Column 2: Form */}
                <div className={styles.formColumn}>
                    <h1 className={styles.title} style={{ textAlign: 'left', fontSize: '1.5rem', marginBottom: '20px' }}>
                        Personaliza tu Experiencia
                    </h1>

                    {error && <div className={styles.error}>{error}</div>}

                    <form id="quote-form" onSubmit={handleSubmit}>
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>1. {tourMode ? 'Fecha del Tour' : 'Fechas de Viaje'}</div>

                            {!tourMode && (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Hotel</label>
                                    <select
                                        className={styles.select}
                                        value={hotelId}
                                        onChange={(e) => { setHotelId(e.target.value); setSelectedExtras([]); }}
                                        required
                                    >
                                        <option value="">-- Elige un Hotel --</option>
                                        {hotels.map(h => (
                                            <option key={h.id} value={h.id}>{h.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: tourMode ? '1fr' : '1fr 1fr', gap: '15px' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{tourMode ? 'Fecha' : 'Llegada'}</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={dates.checkIn}
                                        onChange={(e) => setDates({ ...dates, checkIn: e.target.value, checkOut: tourMode ? e.target.value : dates.checkOut })}
                                        required
                                    />
                                </div>
                                {!tourMode && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Salida</label>
                                        <input
                                            type="date"
                                            className={styles.input}
                                            value={dates.checkOut}
                                            onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>2. Huéspedes</div>

                            <div className={styles.counterContainer}>
                                <div>
                                    <span className={styles.counterLabel}>Adultos</span>
                                    <span className={styles.counterSubLabel}>+12 años</span>
                                </div>
                                <div className={styles.counterControls}>
                                    <div className={styles.counterButton} onClick={() => handleGuestChange('adults', -1)}>-</div>
                                    <span className={styles.value}>{guests.adults}</span>
                                    <div className={styles.counterButton} onClick={() => handleGuestChange('adults', 1)}>+</div>
                                </div>
                            </div>

                            <div className={styles.counterContainer}>
                                <div>
                                    <span className={styles.counterLabel}>Niños</span>
                                    <span className={styles.counterSubLabel}>4 - 10 años</span>
                                </div>
                                <div className={styles.counterControls}>
                                    <div className={styles.counterButton} onClick={() => handleGuestChange('child_4_10', -1)}>-</div>
                                    <span className={styles.value}>{guests.child_4_10}</span>
                                    <div className={styles.counterButton} onClick={() => handleGuestChange('child_4_10', 1)}>+</div>
                                </div>
                            </div>

                            <div className={styles.counterContainer}>
                                <div>
                                    <span className={styles.counterLabel}>Bebés</span>
                                    <span className={styles.counterSubLabel}>0 - 3 años</span>
                                </div>
                                <div className={styles.counterControls}>
                                    <div className={styles.counterButton} onClick={() => handleGuestChange('child_0_3', -1)}>-</div>
                                    <span className={styles.value}>{guests.child_0_3}</span>
                                    <div className={styles.counterButton} onClick={() => handleGuestChange('child_0_3', 1)}>+</div>
                                </div>
                            </div>
                        </div>

                        {/* Extras Section */}
                        {(extras.tours.length > 0 || extras.transfers.length > 0) && (
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>3. Complementos</div>

                                {extras.transfers.length > 0 && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <label className={styles.label}>Traslados</label>
                                        <div className={styles.extrasGrid}>
                                            {extras.transfers.map((t: any) => (
                                                <div
                                                    key={t.id}
                                                    className={`${styles.extraCard} ${selectedExtras.find(e => e.id === t.id && e.type === 'transfer') ? styles.selected : ''}`}
                                                    onClick={() => toggleExtra(t, 'transfer')}
                                                >
                                                    <div className={styles.extraName}>{t.name}</div>
                                                    <div className={styles.extraPrice}>+${t.price} pp</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {extras.tours.length > 0 && (
                                    <div>
                                        <label className={styles.label}>Tours</label>
                                        <div className={styles.extrasGrid}>
                                            {extras.tours.map((t: any) => (
                                                <div
                                                    key={t.id}
                                                    className={`${styles.extraCard} ${selectedExtras.find(e => e.id === t.id && e.type === 'tour') ? styles.selected : ''}`}
                                                    onClick={() => toggleExtra(t, 'tour')}
                                                >
                                                    <div className={styles.extraName}>{t.name}</div>
                                                    <div className={styles.extraPrice}>+${t.price} pp</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>4. Contacto</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nombre</label>
                                    <input
                                        className={styles.input}
                                        value={contact.firstName}
                                        onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Apellido</label>
                                    <input
                                        className={styles.input}
                                        value={contact.lastName}
                                        onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Documento (ID)</label>
                                <input
                                    className={styles.input}
                                    value={contact.documentId}
                                    onChange={(e) => setContact({ ...contact, documentId: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={contact.email}
                                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Teléfono</label>
                                <input
                                    type="tel"
                                    className={styles.input}
                                    value={contact.phone}
                                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Column 3: Feedback */}
                <div className={styles.feedbackColumn}>
                    <h3 className={styles.sectionTitle}>Resumen</h3>
                    <div className={styles.summaryRow}>
                        <span>Check-in</span>
                        <b>{dates.checkIn ? new Date(dates.checkIn).toLocaleDateString() : '-'}</b>
                    </div>
                    {!tourMode && (
                        <div className={styles.summaryRow}>
                            <span>Check-out</span>
                            <b>{dates.checkOut ? new Date(dates.checkOut).toLocaleDateString() : '-'}</b>
                        </div>
                    )}
                    <div className={styles.summaryRow}>
                        <span>Pasajeros</span>
                        <b>{guests.adults} Ad, {guests.child_4_10 + guests.child_0_3} Niños</b>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Extras</span>
                        <b>{selectedExtras.length}</b>
                    </div>

                    <div className={styles.summaryTotal}>
                        <span className={styles.totalLabel}>Total Estimado</span>
                        <span className={styles.totalValue}>${Math.round(animatedPrice).toLocaleString()}</span>
                    </div>

                    <button
                        type="submit"
                        form="quote-form" // Link to form outside
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Calculando...' : 'COTIZAR AHORA'}
                    </button>
                </div>
            </div>
        </div>
    );
}
