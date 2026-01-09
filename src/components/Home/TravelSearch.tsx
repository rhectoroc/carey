"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Hotel, Compass, ChevronDown, Dog } from 'lucide-react';
import styles from './TravelSearch.module.css';

// Popular destinations in Venezuela
const destinations = [
    "Isla de Margarita",
    "Los Roques",
    "Canaima",
    "Mérida",
    "Delta del Orinoco",
    "Isla de Coche",
    "Isla de Cubagua",
    "Morrocoy",
    "Caracas",
    "Maracaibo",
    "Valencia",
    "Barquisimeto"
];

export default function TravelSearch() {
    const [searchType, setSearchType] = useState<'hotels' | 'experiences'>('hotels');
    const [destination, setDestination] = useState('');
    const [showDestinations, setShowDestinations] = useState(false);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [pets, setPets] = useState(0);
    const [showGuestPicker, setShowGuestPicker] = useState(false);

    const destinationRef = useRef<HTMLDivElement>(null);
    const guestRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
                setShowDestinations(false);
            }
            if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
                setShowGuestPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = () => {
        const searchData = {
            type: searchType,
            destination,
            checkIn,
            checkOut,
            guests: { adults, children, pets }
        };
        console.log('Search:', searchData);
        // TODO: Implement search logic
    };

    const totalGuests = adults + children + pets;

    return (
        <div className={styles.searchContainer}>
            {/* Type Toggle */}
            <div className={styles.typeToggle}>
                <button
                    className={`${styles.toggleBtn} ${searchType === 'hotels' ? styles.active : ''}`}
                    onClick={() => setSearchType('hotels')}
                >
                    <Hotel size={20} />
                    <span>Hoteles</span>
                </button>
                <button
                    className={`${styles.toggleBtn} ${searchType === 'experiences' ? styles.active : ''}`}
                    onClick={() => setSearchType('experiences')}
                >
                    <Compass size={20} />
                    <span>Experiencias</span>
                </button>
            </div>

            {/* Search Fields */}
            <div className={styles.inputsRow}>
                {/* Destination Selector */}
                <div className={styles.field} ref={destinationRef}>
                    <label className={styles.label}>Destino</label>
                    <div
                        className={styles.inputWrapper}
                        onClick={() => setShowDestinations(!showDestinations)}
                    >
                        <MapPin size={18} className={styles.icon} />
                        <input
                            type="text"
                            placeholder="¿A dónde quieres ir?"
                            className={styles.input}
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            onFocus={() => setShowDestinations(true)}
                        />
                        <ChevronDown size={18} className={styles.chevron} />
                    </div>

                    {showDestinations && (
                        <div className={styles.dropdown}>
                            {destinations
                                .filter(dest =>
                                    dest.toLowerCase().includes(destination.toLowerCase())
                                )
                                .map((dest, index) => (
                                    <div
                                        key={index}
                                        className={styles.dropdownItem}
                                        onClick={() => {
                                            setDestination(dest);
                                            setShowDestinations(false);
                                        }}
                                    >
                                        <MapPin size={16} />
                                        <span>{dest}</span>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>

                {/* Check-in Date */}
                <div className={styles.field}>
                    <label className={styles.label}>Check In</label>
                    <div className={styles.inputWrapper}>
                        <Calendar size={18} className={styles.icon} />
                        <input
                            type="date"
                            className={styles.input}
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>

                {/* Check-out Date */}
                <div className={styles.field}>
                    <label className={styles.label}>Check Out</label>
                    <div className={styles.inputWrapper}>
                        <Calendar size={18} className={styles.icon} />
                        <input
                            type="date"
                            className={styles.input}
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>

                {/* Guests Picker */}
                <div className={styles.field} ref={guestRef}>
                    <label className={styles.label}>Huéspedes</label>
                    <div
                        className={styles.inputWrapper}
                        onClick={() => setShowGuestPicker(!showGuestPicker)}
                    >
                        <Users size={18} className={styles.icon} />
                        <input
                            type="text"
                            className={styles.input}
                            value={`${totalGuests} ${totalGuests === 1 ? 'Huésped' : 'Huéspedes'}`}
                            readOnly
                        />
                        <ChevronDown size={18} className={styles.chevron} />
                    </div>

                    {showGuestPicker && (
                        <div className={styles.guestPicker}>
                            {/* Adults */}
                            <div className={styles.guestRow}>
                                <div className={styles.guestLabel}>
                                    <Users size={18} />
                                    <div>
                                        <div className={styles.guestTitle}>Adultos</div>
                                        <div className={styles.guestSubtitle}>13+ años</div>
                                    </div>
                                </div>
                                <div className={styles.counter}>
                                    <button
                                        className={styles.counterBtn}
                                        onClick={() => setAdults(Math.max(1, adults - 1))}
                                        disabled={adults <= 1}
                                    >
                                        −
                                    </button>
                                    <span className={styles.counterValue}>{adults}</span>
                                    <button
                                        className={styles.counterBtn}
                                        onClick={() => setAdults(adults + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Children */}
                            <div className={styles.guestRow}>
                                <div className={styles.guestLabel}>
                                    <Users size={18} />
                                    <div>
                                        <div className={styles.guestTitle}>Niños</div>
                                        <div className={styles.guestSubtitle}>2-12 años</div>
                                    </div>
                                </div>
                                <div className={styles.counter}>
                                    <button
                                        className={styles.counterBtn}
                                        onClick={() => setChildren(Math.max(0, children - 1))}
                                        disabled={children <= 0}
                                    >
                                        −
                                    </button>
                                    <span className={styles.counterValue}>{children}</span>
                                    <button
                                        className={styles.counterBtn}
                                        onClick={() => setChildren(children + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Pets */}
                            <div className={styles.guestRow}>
                                <div className={styles.guestLabel}>
                                    <Dog size={18} />
                                    <div>
                                        <div className={styles.guestTitle}>Mascotas</div>
                                        <div className={styles.guestSubtitle}>Perros, gatos, etc.</div>
                                    </div>
                                </div>
                                <div className={styles.counter}>
                                    <button
                                        className={styles.counterBtn}
                                        onClick={() => setPets(Math.max(0, pets - 1))}
                                        disabled={pets <= 0}
                                    >
                                        −
                                    </button>
                                    <span className={styles.counterValue}>{pets}</span>
                                    <button
                                        className={styles.counterBtn}
                                        onClick={() => setPets(pets + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Button */}
            <button className={styles.searchBtn} onClick={handleSearch}>
                <Search size={20} />
                <span>Buscar {searchType === 'hotels' ? 'Hoteles' : 'Experiencias'}</span>
            </button>
        </div>
    );
}
