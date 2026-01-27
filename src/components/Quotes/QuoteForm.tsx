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

    if (submitted) {
        return (
            <div className={styles.container}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>✓</div>
                    <h2 className={styles.title} style={{ marginBottom: '10px' }}>¡Cotización Lista!</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Hola <b>{contact.firstName}</b>, hemos calculado tu presupuesto estimado.
                    </p>

                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '20px' }}>
                        {hotelId && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#666' }}>Hotel:</span>
                                <span style={{ fontWeight: 'bold' }}>{hotels.find(h => h.id === Number(hotelId))?.name || 'Hotel'}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ color: '#666' }}>Extras:</span>
                            <span style={{ fontWeight: 'bold' }}>{selectedExtras.length} seleccionados</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ color: '#666' }}>Pasajeros:</span>
                            <span style={{ fontWeight: 'bold' }}>
                                {guests.adults} Ad, {guests.child_4_10 + guests.child_0_3} Niños
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total Estimado:</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#16a34a' }}>
                                ${Number(quoteResult?.total_price).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#888' }}>
                        *Un agente te contactará pronto para confirmar disponibilidad.
                    </p>

                    <button
                        onClick={() => { setSubmitted(false); setQuoteResult(null); setLiveTotal(0); }}
                        className={styles.submitButton}
                        style={{ background: 'white', color: '#333', border: '1px solid #ddd', marginTop: '20px' }}
                    >
                        Nueva Cotización
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                {tourMode ? (tourName ? `Cotizando: ${tourName}` : 'Cotizando Tour') : 'Cotiza tu Viaje'}
            </h1>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className={styles.formSection}>
                    <div className={styles.sectionTitle}>1. {tourMode ? 'Fecha del Tour' : 'Destino y Fechas'}</div>

                    {!tourMode && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Selecciona tu Hotel</label>
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

                {/* Extras Section - Only shows if hotel/extras loaded */}
                {(extras.tours.length > 0 || extras.transfers.length > 0) && (
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>3. Actividades y Traslados</div>

                        {extras.transfers.length > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <label className={styles.label}>Traslados Disponibles</label>
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
                                <label className={styles.label}>Tours Recomendados</label>
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
                    <div className={styles.sectionTitle}>4. Tus Datos</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nombre</label>
                            <input
                                className={styles.input}
                                placeholder="Juan"
                                value={contact.firstName}
                                onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Apellido</label>
                            <input
                                className={styles.input}
                                placeholder="Pérez"
                                value={contact.lastName}
                                onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Documento de Identidad (Cédula/Pasaporte)</label>
                        <input
                            className={styles.input}
                            placeholder="V-12345678"
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
                            placeholder="juan@ejemplo.com"
                            value={contact.email}
                            onChange={(e) => setContact({ ...contact, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Teléfono (WhatsApp)</label>
                        <input
                            type="tel"
                            className={styles.input}
                            placeholder="+58 412 1234567"
                            value={contact.phone}
                            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles.pricePreview} style={{ transition: 'all 0.3s' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>Presupuesto Estimado</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2563eb' }}>
                        ${liveTotal.toLocaleString()}
                    </div>
                </div>

                <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Generando Cotización...' : 'Enviar Solicitud'}
                </button>
            </form >
        </div >
    );
}
