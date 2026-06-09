"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Hotel, Plane, Compass, ChevronDown, MousePointer2, Briefcase, User, PawPrint, IceCream, Baby } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './TravelSearch.module.css';

import { useRouter } from 'next/navigation';

interface Destination {
    id: number;
    name: string;
    type: string;
    country: string;
}

export default function TravelSearch() {
    const { t } = useLanguage();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'hotels' | 'tours'>('hotels');

    // Form States
    const [destination, setDestination] = useState('');
    const [suggestions, setSuggestions] = useState<Destination[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<'dest' | null>(null);

    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [pets, setPets] = useState(0);
    const [showGuestPicker, setShowGuestPicker] = useState(false);

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
    const fetchDestinations = async (query: string = '') => {
        try {
            const url = query
                ? `/api/search/destinations?q=${encodeURIComponent(query)}`
                : '/api/search/destinations';
            const res = await fetch(url);
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

        // Guests
        params.set('adults', adults.toString());
        params.set('children', children.toString());
        params.set('infants', infants.toString());
        params.set('pets', pets.toString());

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
                    <Hotel size={18} /> {t('search.hotels')}
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'tours' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('tours')}
                >
                    <Compass size={18} /> {t('search.tours')}
                </button>
            </div>

            <div className={styles.searchBody}>
                <div className={styles.inputsGrid}>

                    {/* DESTINATION */}
                    <div className={styles.field} style={{ flex: 2 }}>
                        <label>{t('search.destination')}</label>
                        <div className={styles.inputWrapper}>
                            <MapPin size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder={t('search.placeholder')}
                                value={destination}
                                onFocus={() => {
                                    fetchDestinations(destination);
                                    setShowSuggestions('dest');
                                }}
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

                    {/* GUESTS / PASSENGERS */}
                    <div className={styles.field} style={{ position: 'relative', flex: 1 }}>
                        <label>{activeTab === 'tours' ? t('search.people') : t('search.guests')}</label>
                        <div className={styles.inputWrapper} onClick={() => setShowGuestPicker(!showGuestPicker)} style={{ cursor: 'pointer' }}>
                            <div className={styles.guestSummary}>
                                <div className={styles.guestItem}>
                                    <User size={16} fill="#1F6D8C" color="#1F6D8C" /> <span>{adults}</span>
                                </div>
                                {children > 0 && (
                                    <div className={styles.guestItem}>
                                        <IceCream size={16} fill="#1F6D8C" color="#1F6D8C" /> <span>{children}</span>
                                    </div>
                                )}
                                {infants > 0 && (
                                    <div className={styles.guestItem}>
                                        <Baby size={16} fill="#1F6D8C" color="#1F6D8C" /> <span>{infants}</span>
                                    </div>
                                )}
                                {pets > 0 && (
                                    <div className={styles.guestItem}>
                                        <PawPrint size={16} fill="#1F6D8C" color="#1F6D8C" /> <span>{pets}</span>
                                    </div>
                                )}
                            </div>
                            <ChevronDown size={16} />
                        </div>

                        {showGuestPicker && (
                            <div className={styles.guestPopup}>
                                <div className={styles.guestRow}>
                                    <div><span>{t('search.adults')}</span><small>11+ años</small></div>
                                    <div className={styles.counterControl}>
                                        <button onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                                        <span>{adults}</span>
                                        <button onClick={() => setAdults(adults + 1)}>+</button>
                                    </div>
                                </div>
                                <div className={styles.guestRow}>
                                    <div><span>{t('search.children')}</span><small>4-10 años</small></div>
                                    <div className={styles.counterControl}>
                                        <button onClick={() => setChildren(Math.max(0, children - 1))}>-</button>
                                        <span>{children}</span>
                                        <button onClick={() => setChildren(children + 1)}>+</button>
                                    </div>
                                </div>
                                <div className={styles.guestRow}>
                                    <div><span>{t('search.infants')}</span><small>0-3 años</small></div>
                                    <div className={styles.counterControl}>
                                        <button onClick={() => setInfants(Math.max(0, infants - 1))}>-</button>
                                        <span>{infants}</span>
                                        <button onClick={() => setInfants(infants + 1)}>+</button>
                                    </div>
                                </div>
                                <div className={styles.guestRow}>
                                    <div><span>{t('search.pets')}</span><small>Gatos o Perros</small></div>
                                    <div className={styles.counterControl}>
                                        <button onClick={() => setPets(Math.max(0, pets - 1))}>-</button>
                                        <span>{pets}</span>
                                        <button onClick={() => setPets(pets + 1)}>+</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.searchActionContainer}>
                        <button className={styles.searchActionBtn} onClick={handleSearch}>
                            <Search size={20} />
                            {t('search.button')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
