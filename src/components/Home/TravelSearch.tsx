"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Hotel, Plane, Compass, ChevronDown, Dog, Briefcase } from 'lucide-react';
import styles from './TravelSearch.module.css';

import { useRouter } from 'next/navigation';

interface Destination {
    id: number;
    name: string;
    type: string;
    country: string;
}

export default function TravelSearch() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'hotels' | 'flights' | 'tours'>('hotels');

    // ... (rest of states remain the same)

    const handleSearch = () => {
        const params = new URLSearchParams();
        params.set('type', activeTab);

        if (destination) params.set('location', destination);
        if (checkIn) params.set('checkIn', checkIn);
        if (checkOut) params.set('checkOut', checkOut);

        // Guests
        params.set('adults', adults.toString());
        params.set('children', children.toString());
        params.set('pets', pets.toString());

        if (activeTab === 'flights') {
            if (origin) params.set('origin', origin);
            params.set('class', flightClass);
        }

        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className={styles.searchContainer} ref={wrapperRef}>
            {/* TABS HEADER */}
            <div className={styles.tabsHeader}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'hotels' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('hotels')}
                >
                    <Hotel size={18} /> Hoteles
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'flights' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('flights')}
                >
                    <Plane size={18} /> Vuelos
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'tours' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('tours')}
                >
                    <Compass size={18} /> Tours
                </button>
            </div>

            <div className={styles.searchBody}>
                <div className={styles.inputsGrid}>

                    {/* ORIGIN (Only for Flights) */}
                    {activeTab === 'flights' && (
                        <div className={styles.field}>
                            <label>Origen</label>
                            <div className={styles.inputWrapper}>
                                <MapPin size={18} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Ciudad de origen"
                                    value={origin}
                                    onChange={(e) => {
                                        setOrigin(e.target.value);
                                        fetchDestinations(e.target.value);
                                        setShowSuggestions('origin');
                                    }}
                                />
                            </div>
                            {showSuggestions === 'origin' && suggestions.length > 0 && (
                                <div className={styles.suggestionsList}>
                                    {suggestions.map((s) => (
                                        <div key={s.id} onClick={() => { setOrigin(s.name); setShowSuggestions(null); }} className={styles.suggestionItem}>
                                            <MapPin size={14} /> {s.name}, {s.country}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DESTINATION */}
                    <div className={styles.field} style={{ flex: 2 }}>
                        <label>Destino</label>
                        <div className={styles.inputWrapper}>
                            <MapPin size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder={activeTab === 'flights' ? "Ciudad de destino" : "¿A dónde quieres ir?"}
                                value={destination}
                                onChange={(e) => {
                                    setDestination(e.target.value);
                                    fetchDestinations(e.target.value);
                                    setShowSuggestions('dest');
                                }}
                            />
                        </div>
                        {showSuggestions === 'dest' && suggestions.length > 0 && (
                            <div className={styles.suggestionsList}>
                                {suggestions.map((s) => (
                                    <div key={s.id} onClick={() => { setDestination(s.name); setShowSuggestions(null); }} className={styles.suggestionItem}>
                                        <MapPin size={14} /> {s.name}, {s.country}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DATES */}
                    <div className={styles.field}>
                        <label>{activeTab === 'flights' ? 'Ida' : 'Entrada'}</label>
                        <div className={styles.inputWrapper}>
                            <Calendar size={18} className={styles.inputIcon} />
                            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>{activeTab === 'flights' ? 'Vuelta' : 'Salida'}</label>
                        <div className={styles.inputWrapper}>
                            <Calendar size={18} className={styles.inputIcon} />
                            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn} />
                        </div>
                    </div>

                    {/* GUESTS / PASSENGERS */}
                    <div className={styles.field} style={{ position: 'relative' }}>
                        <label>{activeTab === 'flights' ? 'Pasajeros' : 'Huéspedes'}</label>
                        <div className={styles.inputWrapper} onClick={() => setShowGuestPicker(!showGuestPicker)}>
                            <Users size={18} className={styles.inputIcon} />
                            <span style={{ flex: 1, fontSize: '0.95rem' }}>
                                {adults + children + pets} {activeTab === 'flights' ? 'Pasajeros' : 'Personas'}
                            </span>
                            <ChevronDown size={16} />
                        </div>

                        {showGuestPicker && (
                            <div className={styles.guestPopup}>
                                <div className={styles.guestRow}>
                                    <div><span>Adultos</span><small>13+ años</small></div>
                                    <div className={styles.counterControl}>
                                        <button onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                                        <span>{adults}</span>
                                        <button onClick={() => setAdults(adults + 1)}>+</button>
                                    </div>
                                </div>
                                <div className={styles.guestRow}>
                                    <div><span>Niños</span><small>2-12 años</small></div>
                                    <div className={styles.counterControl}>
                                        <button onClick={() => setChildren(Math.max(0, children - 1))}>-</button>
                                        <span>{children}</span>
                                        <button onClick={() => setChildren(children + 1)}>+</button>
                                    </div>
                                </div>
                                {activeTab !== 'flights' && (
                                    <div className={styles.guestRow}>
                                        <div><span>Mascotas</span><small>Si aplica</small></div>
                                        <div className={styles.counterControl}>
                                            <button onClick={() => setPets(Math.max(0, pets - 1))}>-</button>
                                            <span>{pets}</span>
                                            <button onClick={() => setPets(pets + 1)}>+</button>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'flights' && (
                                    <div className={styles.classSelector}>
                                        <label>Clase</label>
                                        <select value={flightClass} onChange={(e) => setFlightClass(e.target.value)}>
                                            <option value="Economy">Económica</option>
                                            <option value="Premium">Premium</option>
                                            <option value="Business">Business</option>
                                            <option value="First">Primera</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.searchFooter}>
                    <button className={styles.searchActionBtn} onClick={handleSearch}>
                        <Search size={20} />
                        Buscar {activeTab === 'flights' ? 'Vuelos' : activeTab === 'tours' ? 'Experiencias' : 'Hoteles'}
                    </button>
                </div>
            </div>
        </div>
    );
}
