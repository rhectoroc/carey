'use client';

import React, { useState, useEffect } from 'react';
import styles from './quote.module.css';
import { useSearchParams } from 'next/navigation';

export default function QuoteForm() {
    const searchParams = useSearchParams();
    const [hotels, setHotels] = useState<any[]>([]);
    const [extras, setExtras] = useState<{ tours: any[], transfers: any[] }>({ tours: [], transfers: [] });

    // Extras Toggle State
    const [showExtras, setShowExtras] = useState(false);

    // ... (keep useEffects) ...

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
                <div className={styles.formHeader} style={{ marginBottom: '20px' }}>
                    <h1 className={styles.mainHeading} style={{ fontSize: '1.5rem' }}>Personaliza tu Viaje</h1>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}

                <form id="quote-form" onSubmit={handleSubmit}>
                    {/* 1. COMPACT ROW: Hotel + Dates */}
                    <div className={styles.formSection} style={{ marginBottom: '20px' }}>
                        <div className={styles.compactRow}>
                            {!tourMode && (
                                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.label} style={{ fontSize: '0.8rem' }}>Hotel Preferido</label>
                                    <select
                                        className={`${styles.select} ${styles.compactInput}`}
                                        value={hotelId}
                                        onChange={(e) => { setHotelId(e.target.value); setSelectedExtras([]); }}
                                        required
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {hotels.map(h => (
                                            <option key={h.id} value={h.id}>{h.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.label} style={{ fontSize: '0.8rem' }}>{tourMode ? 'Fecha' : 'Llegada'}</label>
                                <input type="date" className={`${styles.input} ${styles.compactInput}`} value={dates.checkIn} onChange={(e) => setDates({ ...dates, checkIn: e.target.value, checkOut: tourMode ? e.target.value : dates.checkOut })} required />
                            </div>
                            {!tourMode && (
                                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.label} style={{ fontSize: '0.8rem' }}>Salida</label>
                                    <input type="date" className={`${styles.input} ${styles.compactInput}`} value={dates.checkOut} onChange={(e) => setDates({ ...dates, checkOut: e.target.value })} required />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. COMPACT ROW: Guests */}
                    <div className={styles.formSection} style={{ marginBottom: '20px' }}>
                        <div className={styles.passengersRow}>
                            <div className={styles.passengerItem}>
                                <span className={styles.passengerLabel}>Adultos</span>
                                <div className={styles.miniCounterControls}>
                                    <button type="button" className={styles.miniCounterButton} onClick={() => handleGuestChange('adults', -1)}>-</button>
                                    <span className={styles.miniValue}>{guests.adults}</span>
                                    <button type="button" className={styles.miniCounterButton} onClick={() => handleGuestChange('adults', 1)}>+</button>
                                </div>
                            </div>
                            <div className={styles.passengerItem}>
                                <span className={styles.passengerLabel}>Niños (4-10)</span>
                                <div className={styles.miniCounterControls}>
                                    <button type="button" className={styles.miniCounterButton} onClick={() => handleGuestChange('child_4_10', -1)}>-</button>
                                    <span className={styles.miniValue}>{guests.child_4_10}</span>
                                    <button type="button" className={styles.miniCounterButton} onClick={() => handleGuestChange('child_4_10', 1)}>+</button>
                                </div>
                            </div>
                            <div className={styles.passengerItem}>
                                <span className={styles.passengerLabel}>Bebés (0-3)</span>
                                <div className={styles.miniCounterControls}>
                                    <button type="button" className={styles.miniCounterButton} onClick={() => handleGuestChange('child_0_3', -1)}>-</button>
                                    <span className={styles.miniValue}>{guests.child_0_3}</span>
                                    <button type="button" className={styles.miniCounterButton} onClick={() => handleGuestChange('child_0_3', 1)}>+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Extras MARQUEE */}
                    {(extras.tours.length > 0 || extras.transfers.length > 0) && (
                        <div className={styles.formSection} style={{ marginBottom: '20px' }}>
                            {!showExtras ? (
                                <div className={styles.marqueeBanner} onClick={() => setShowExtras(true)}>
                                    ✨ ¡Mejora tu experiencia! Agrega Tours y Traslados ✨
                                </div>
                            ) : (
                                <div style={{ animation: 'fadeInUp 0.3s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>Servicios Adicionales</div>
                                        <button type="button" onClick={() => setShowExtras(false)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '0.8rem' }}>Ocultar</button>
                                    </div>

                                    {extras.transfers.length > 0 && (
                                        <div style={{ marginBottom: '15px' }}>
                                            <label className={styles.label} style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Traslados</label>
                                            <div className={styles.extrasGrid}>
                                                {extras.transfers.map((t: any) => (
                                                    <div key={t.id} className={`${styles.extraCard} ${selectedExtras.find(e => e.id === t.id && e.type === 'transfer') ? styles.selected : ''}`} onClick={() => toggleExtra(t, 'transfer')} style={{ padding: '10px' }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>+${t.price}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {extras.tours.length > 0 && (
                                        <div>
                                            <label className={styles.label} style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Tours</label>
                                            <div className={styles.extrasGrid}>
                                                {extras.tours.map((t: any) => (
                                                    <div key={t.id} className={`${styles.extraCard} ${selectedExtras.find(e => e.id === t.id && e.type === 'tour') ? styles.selected : ''}`} onClick={() => toggleExtra(t, 'tour')} style={{ padding: '10px' }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>+${t.price}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}



                    {/* 4. Contact COMPACT */}
                    <div className={styles.formSection} style={{ marginBottom: '10px' }}>
                        <div className={styles.sectionTitle} style={{ marginBottom: '10px', fontSize: '0.8rem' }}>Datos Personales</div>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <input className={`${styles.input} ${styles.compactInput}`} placeholder="Nombre" value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <input className={`${styles.input} ${styles.compactInput}`} placeholder="Apellido" value={contact.lastName} onChange={(e) => setContact({ ...contact, lastName: e.target.value })} required />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <input className={`${styles.input} ${styles.compactInput}`} placeholder="Documento (ID)" value={contact.documentId} onChange={(e) => setContact({ ...contact, documentId: e.target.value })} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <input type="tel" className={`${styles.input} ${styles.compactInput}`} placeholder="Teléfono" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input type="email" className={`${styles.input} ${styles.compactInput}`} placeholder="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required />
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
