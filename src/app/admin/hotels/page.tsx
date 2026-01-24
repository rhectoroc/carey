'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Hotel {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    destination_id: number;
    destination_name?: string;
    image_url: string;
    stars: number;
    features: any; // JSONB
    is_featured: boolean;
    is_promotion: boolean;
}

interface Destination {
    id: number;
    name: string;
}

export default function HotelsPage() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentHotel, setCurrentHotel] = useState<Partial<Hotel>>({});
    const [loading, setLoading] = useState(false);
    const [featuresInput, setFeaturesInput] = useState('');

    useEffect(() => {
        fetchHotels();
        fetchDestinations();
    }, []);

    const fetchHotels = async () => {
        const res = await fetch('/api/admin/hotels');
        if (res.ok) {
            const data = await res.json();
            setHotels(data);
        }
    };

    const fetchDestinations = async () => {
        const res = await fetch('/api/admin/destinations');
        if (res.ok) {
            const data = await res.json();
            setDestinations(data);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this hotel?')) {
            const res = await fetch(`/api/admin/hotels/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchHotels();
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Parse features
        const featuresArray = featuresInput.split(',').map(f => f.trim()).filter(f => f);

        const payload = {
            ...currentHotel,
            features: featuresArray,
            price: Number(currentHotel.price),
            stars: Number(currentHotel.stars),
            destination_id: Number(currentHotel.destination_id)
        };

        const method = currentHotel.id ? 'PUT' : 'POST';
        const url = currentHotel.id
            ? `/api/admin/hotels/${currentHotel.id}`
            : '/api/admin/hotels';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchHotels();
            } else {
                const err = await res.json();
                alert('Failed to save: ' + (err.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (hotel?: Hotel) => {
        if (hotel) {
            setCurrentHotel(hotel);
            setFeaturesInput(Array.isArray(hotel.features) ? hotel.features.join(', ') : '');
        } else {
            setCurrentHotel({ is_featured: false, stars: 3 });
            setFeaturesInput('');
        }
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Hotels</h1>
                <button className={styles.actionButton} onClick={() => openModal()}>
                    <Plus size={18} /> Add Hotel
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Destination</th>
                            <th>Price</th>
                            <th>Stars</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotels.map((hotel) => (
                            <tr key={hotel.id}>
                                <td>{hotel.name}</td>
                                <td>{hotel.destination_name || '-'}</td>
                                <td>${hotel.price}</td>
                                <td>{hotel.stars} ★</td>
                                <td>
                                    <Edit
                                        className={styles.actionIcon}
                                        size={18}
                                        onClick={() => openModal(hotel)}
                                    />
                                    <Trash2
                                        className={styles.actionIcon}
                                        size={18}
                                        onClick={() => handleDelete(hotel.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {currentHotel.id ? 'Edit Hotel' : 'Add Hotel'}
                            </h2>
                            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} style={{ color: '#333' }}>Name</label>
                                <input
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentHotel.name || ''}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label} style={{ color: '#333' }}>Slug</label>
                                <input
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentHotel.slug || ''}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, slug: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label} style={{ color: '#333' }}>Destination</label>
                                <select
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentHotel.destination_id || ''}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, destination_id: Number(e.target.value) })}
                                    required
                                >
                                    <option value="">Select Destination</option>
                                    {destinations.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className={styles.formGroup} style={{ flex: 1 }}>
                                    <label className={styles.label} style={{ color: '#333' }}>Price</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                        value={currentHotel.price || ''}
                                        onChange={(e) => setCurrentHotel({ ...currentHotel, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div className={styles.formGroup} style={{ flex: 1 }}>
                                    <label className={styles.label} style={{ color: '#333' }}>Stars (1-5)</label>
                                    <input
                                        type="number"
                                        min="1" max="5"
                                        className={styles.input}
                                        style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                        value={currentHotel.stars || ''}
                                        onChange={(e) => setCurrentHotel({ ...currentHotel, stars: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label} style={{ color: '#333' }}>Features (comma separated)</label>
                                <input
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={featuresInput}
                                    onChange={(e) => setFeaturesInput(e.target.value)}
                                    placeholder="Wifi, Pool, Spa"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label} style={{ color: '#333' }}>Image URL</label>
                                <input
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentHotel.image_url || ''}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, image_url: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ display: 'flex', gap: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                                    <input
                                        type="checkbox"
                                        checked={currentHotel.is_featured || false}
                                        onChange={(e) => setCurrentHotel({ ...currentHotel, is_featured: e.target.checked })}
                                    />
                                    Featured
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e63946' }}>
                                    <input
                                        type="checkbox"
                                        checked={currentHotel.is_promotion || false}
                                        onChange={(e) => setCurrentHotel({ ...currentHotel, is_promotion: e.target.checked })}
                                    />
                                    Es Promoción
                                </label>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.saveButton} disabled={loading}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
