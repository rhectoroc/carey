"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Hotel, Plane, Compass, ChevronDown, MousePointer2, Briefcase, User, Baby, PawPrint, PersonStanding } from 'lucide-react';
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

    // Form States
    const [destination, setDestination] = useState('');
    const [origin, setOrigin] = useState(''); // For flights
    const [suggestions, setSuggestions] = useState<Destination[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<'dest' | 'origin' | null>(null);

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [pets, setPets] = useState(0);
    const [showGuestPicker, setShowGuestPicker] = useState(false);

    // Flights specific
    const [flightClass, setFlightClass] = useState('Economy');
    const [isOneWay, setIsOneWay] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(null);
                setShowGuestPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Autocomplete Fetch
    const fetchDestinations = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`/api/search/destinations?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        params.set('type', activeTab);

        if (destination) params.set('location', destination);
        if (checkIn) params.set('checkIn', checkIn);
        if (checkOut) params.set('checkOut', checkOut);

        // Guests
        params.set('adults', adults.toString());
        params.set('children', children.toString());
        params.set('infants', infants.toString());
        params.set('pets', pets.toString());

        if (activeTab === 'flights') {
            if (origin) params.set('origin', origin);
            params.set('class', flightClass);
            if (isOneWay) params.set('oneWay', 'true');
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label>Origen</label>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={isOneWay}
                                        onChange={(e) => setIsOneWay(e.target.checked)}
                                    />
                                    Solo ida
                                </label>
                            </div>
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
                        <label>{activeTab === 'tours' ? 'Fecha' : activeTab === 'flights' ? 'Ida' : 'Entrada'}</label>
                        <div className={styles.inputWrapper}>
                            <Calendar size={18} className={styles.inputIcon} />
                            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>

                    {activeTab !== 'tours' && (
                        (!isOneWay || activeTab !== 'flights') && (
                            <div className={styles.field}>
                                <label>{activeTab === 'flights' ? 'Vuelta' : 'Salida'}</label>
                                <div className={styles.inputWrapper}>
                                    <Calendar size={18} className={styles.inputIcon} />
                                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn} />
                                </div>
                            </div>
                        )
                    )}

                    {/* GUESTS / PASSENGERS */}
                    <div className={styles.field} style={{ position: 'relative' }}>
                        <label>{activeTab === 'flights' ? 'Pasajeros' : activeTab === 'tours' ? 'Personas' : 'Huéspedes'}</label>
                        <div className={styles.inputWrapper} onClick={() => setShowGuestPicker(!showGuestPicker)}>
                            <Users size={18} className={styles.inputIcon} />
                            <div className={styles.guestSummary}>
                                <div className={styles.guestItem}>
                                    <User size={18} fill="#1F6D8C" color="#1F6D8C" /> <span>{adults}</span>
                                </div>
                                {children > 0 && (
                                    <div className={styles.guestItem}>
                                        <PersonStanding size={18} fill="#1F6D8C" color="#1F6D8C" /> <span>{children}</span>
                                    </div>
                                )}
                                {infants > 0 && (
                                    <div className={styles.guestItem}>
                                        <Baby size={18} fill="#1F6D8C" color="#1F6D8C" /> <span>{infants}</span>
                                    </div>
                                )}
                                {pets > 0 && (
                                    <div className={styles.guestItem}>
                                        <PawPrint size={18} fill="#1F6D8C" color="#1F6D8C" /> <span>{pets} {pets === 1 ? 'Mascota' : 'Mascotas'}</span>
                                    </div>
                                )}
                            </div>
                            <ChevronDown size={16} />
                        </div>

                        {showGuestPicker && (
                            <div className={styles.guestPopup}>
                                <div className={styles.guestRow}>
                                    <div><span>Adultos</span><small>11+ años</small></div>
                                    <div className={styles.counterControl}>
                                        <button onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                                        <span>{adults}</span>
                                        <button onClick={() => setAdults(adults + 1)}>+</button>
                                    </div>
                                </div>
                                <div className={styles.guestRow}>
                                    <div><span>Niños</span><small>4-10 años</small></div>
                                    <div className={styles.counterControl}>
                                        <button onClick={() => setChildren(Math.max(0, children - 1))}>-</button>
                                        <span>{children}</span>
                                        <button onClick={() => setChildren(children + 1)}>+</button>
                                    </div>
                                </div>
                                <div className={styles.guestRow}>
                                    <div><span>Infantes</span><small>0-3 años</small></div>
                                    <div className={styles.counterControl}>
                                        <button onClick={() => setInfants(Math.max(0, infants - 1))}>-</button>
                                        <span>{infants}</span>
                                        <button onClick={() => setInfants(infants + 1)}>+</button>
                                    </div>
                                </div>
                                {activeTab !== 'flights' && (
                                    <div className={styles.guestRow}>
                                        <div><span>Mascotas</span><small>Gatos o Perros</small></div>
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
