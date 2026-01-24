'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import ImageUpload from '@/components/Admin/ImageUpload';
import ServiceCard from '@/components/Catalog/ServiceCard';

interface Tour {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    duration: string;
    destination_id: number;
    destination_name?: string;
    image_url: string;
    included: any; // JSONB
    is_featured: boolean;
    is_promotion: boolean;
}

interface Destination {
    id: number;
    name: string;
}

export default function ToursPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTour, setCurrentTour] = useState<Partial<Tour>>({});
    const [loading, setLoading] = useState(false);
    const [includedInput, setIncludedInput] = useState('');

    useEffect(() => {
        fetchTours();
        fetchDestinations();
    }, []);

    const fetchTours = async () => {
        const res = await fetch('/api/admin/tours');
        if (res.ok) {
            const data = await res.json();
            setTours(data);
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
        if (confirm('Are you sure you want to delete this tour?')) {
            const res = await fetch(`/api/admin/tours/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchTours();
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const includedArray = includedInput.split(',').map(f => f.trim()).filter(f => f);

        const payload = {
            ...currentTour,
            included: includedArray,
            price: Number(currentTour.price),
            destination_id: Number(currentTour.destination_id)
        };

        const method = currentTour.id ? 'PUT' : 'POST';
        const url = currentTour.id
            ? `/api/admin/tours/${currentTour.id}`
            : '/api/admin/tours';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchTours();
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

    const openModal = (tour?: Tour) => {
        if (tour) {
            setCurrentTour(tour);
            setIncludedInput(Array.isArray(tour.included) ? tour.included.join(', ') : '');
        } else {
            setCurrentTour({ is_featured: false });
            setIncludedInput('');
        }
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Tours</h1>
                <button className={styles.actionButton} onClick={() => openModal()}>
                    <Plus size={18} /> Add Tour
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Destination</th>
                            <th>Price</th>
                            <th>Duration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tours.map((tour) => (
                            <tr key={tour.id}>
                                <td>{tour.name}</td>
                                <td>{tour.destination_name || '-'}</td>
                                <td>${tour.price}</td>
                                <td>{tour.duration}</td>
                                <td>
                                    <Edit
                                        className={styles.actionIcon}
                                        size={18}
                                        onClick={() => openModal(tour)}
                                    />
                                    <Trash2
                                        className={styles.actionIcon}
                                        size={18}
                                        onClick={() => handleDelete(tour.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} ${styles.modalContentWithPreview}`}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {currentTour.id ? 'Edit Tour' : 'Add Tour'}
                            </h2>
                            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalBodySplit}>
                            {/* Form */}
                            <div className={styles.modalForm}>
                                <form onSubmit={handleSave}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ color: '#333' }}>Name</label>
                                        <input
                                            className={styles.input}
                                            style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                            value={currentTour.name || ''}
                                            onChange={(e) => setCurrentTour({ ...currentTour, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ color: '#333' }}>Slug</label>
                                        <input
                                            className={styles.input}
                                            style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                            value={currentTour.slug || ''}
                                            onChange={(e) => setCurrentTour({ ...currentTour, slug: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ color: '#333' }}>Destination</label>
                                        <select
                                            className={styles.input}
                                            style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                            value={currentTour.destination_id || ''}
                                            onChange={(e) => {
                                                const destId = Number(e.target.value);
                                                const dest = destinations.find(d => d.id === destId);
                                                setCurrentTour({ ...currentTour, destination_id: destId, destination_name: dest?.name });
                                            }}
                                            required
                                        >
                                            <option value="">Select Destination</option>
                                            {destinations.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ color: '#333' }}>Description</label>
                                        <textarea
                                            className={styles.input}
                                            style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333', minHeight: '100px' }}
                                            value={currentTour.description || ''}
                                            onChange={(e) => setCurrentTour({ ...currentTour, description: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div className={styles.formGroup} style={{ flex: 1 }}>
                                            <label className={styles.label} style={{ color: '#333' }}>Price</label>
                                            <input
                                                type="number"
                                                className={styles.input}
                                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                                value={currentTour.price || ''}
                                                onChange={(e) => setCurrentTour({ ...currentTour, price: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className={styles.formGroup} style={{ flex: 1 }}>
                                            <label className={styles.label} style={{ color: '#333' }}>Duration</label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                                value={currentTour.duration || ''}
                                                onChange={(e) => setCurrentTour({ ...currentTour, duration: e.target.value })}
                                                placeholder="e.g. 4 hours"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ color: '#333' }}>Included (comma separated)</label>
                                        <input
                                            className={styles.input}
                                            style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                            value={includedInput}
                                            onChange={(e) => setIncludedInput(e.target.value)}
                                            placeholder="Lunch, Safety Gear, Guide"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ color: '#333' }}>Image / Video</label>
                                        <ImageUpload
                                            value={currentTour.image_url || ''}
                                            onChange={(url) => setCurrentTour({ ...currentTour, image_url: url })}
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ display: 'flex', gap: '20px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                                            <input
                                                type="checkbox"
                                                checked={currentTour.is_featured || false}
                                                onChange={(e) => setCurrentTour({ ...currentTour, is_featured: e.target.checked })}
                                            />
                                            Featured
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e63946' }}>
                                            <input
                                                type="checkbox"
                                                checked={currentTour.is_promotion || false}
                                                onChange={(e) => setCurrentTour({ ...currentTour, is_promotion: e.target.checked })}
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

                            {/* Preview */}
                            <div className={styles.modalPreview}>
                                <div className={styles.modalPreviewTitle}>Live Preview</div>
                                <ServiceCard
                                    service={{
                                        id: 'preview',
                                        title: currentTour.name || 'Tour Name',
                                        category: 'Tour',
                                        price: currentTour.price || 0,
                                        image: currentTour.image_url || 'https://via.placeholder.com/400x300',
                                        location: currentTour.destination_name || 'Destination',
                                        rating: 5,
                                        duration: currentTour.duration
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
