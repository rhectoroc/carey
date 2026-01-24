'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import ImageUpload from '@/components/Admin/ImageUpload';
import ServiceCard from '@/components/Catalog/ServiceCard';

interface Destination {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    is_featured: boolean;
    is_promotion: boolean;
}

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDestination, setCurrentDestination] = useState<Partial<Destination>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        const res = await fetch('/api/admin/destinations');
        if (res.ok) {
            const data = await res.json();
            setDestinations(data);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this destination?')) {
            const res = await fetch(`/api/admin/destinations/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchDestinations();
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const method = currentDestination.id ? 'PUT' : 'POST';
        const url = currentDestination.id
            ? `/api/admin/destinations/${currentDestination.id}`
            : '/api/admin/destinations';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentDestination),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchDestinations();
            } else {
                alert('Failed to save');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (dest?: Destination) => {
        setCurrentDestination(dest || { is_featured: false });
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Destinations</h1>
                <button className={styles.actionButton} onClick={() => openModal()}>
                    <Plus size={18} /> Add Destination
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Featured</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {destinations.map((dest) => (
                            <tr key={dest.id}>
                                <td>{dest.name}</td>
                                <td>{dest.slug}</td>
                                <td>{dest.is_featured ? 'Yes' : 'No'}</td>
                                <td>
                                    <Edit
                                        className={styles.actionIcon}
                                        size={18}
                                        onClick={() => openModal(dest)}
                                    />
                                    <Trash2
                                        className={styles.actionIcon}
                                        size={18}
                                        onClick={() => handleDelete(dest.id)}
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
                                {currentDestination.id ? 'Edit Destination' : 'Add Destination'}
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
                                            value={currentDestination.name || ''}
                                            onChange={(e) => setCurrentDestination({ ...currentDestination, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ color: '#333' }}>Slug</label>
                                        <input
                                            className={styles.input}
                                            style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                            value={currentDestination.slug || ''}
                                            onChange={(e) => setCurrentDestination({ ...currentDestination, slug: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ color: '#333' }}>Image / Video</label>
                                        <ImageUpload
                                            value={currentDestination.image_url || ''}
                                            onChange={(url) => setCurrentDestination({ ...currentDestination, image_url: url })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ color: '#333' }}>Description</label>
                                        <textarea
                                            className={styles.input}
                                            style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333', minHeight: '100px' }}
                                            value={currentDestination.description || ''}
                                            onChange={(e) => setCurrentDestination({ ...currentDestination, description: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ display: 'flex', gap: '20px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                                            <input
                                                type="checkbox"
                                                checked={currentDestination.is_featured || false}
                                                onChange={(e) => setCurrentDestination({ ...currentDestination, is_featured: e.target.checked })}
                                            />
                                            Featured
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e63946' }}>
                                            <input
                                                type="checkbox"
                                                checked={currentDestination.is_promotion || false}
                                                onChange={(e) => setCurrentDestination({ ...currentDestination, is_promotion: e.target.checked })}
                                            />
                                            Es Promoción
                                        </label>
                                    </div>
                                    <div className={styles.modalFooter}>
                                        <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                        <button type="submit" className={styles.saveButton} disabled={loading}>
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Preview */}
                            <div className={styles.modalPreview}>
                                <div className={styles.modalPreviewTitle}>Live Preview</div>
                                <ServiceCard
                                    service={{
                                        id: 'preview',
                                        title: currentDestination.name || 'Destino',
                                        category: 'Circuit', // or customize map
                                        price: 0, // Destinations often don't have a single price, or add one if needed
                                        image: currentDestination.image_url || 'https://via.placeholder.com/400x300',
                                        location: currentDestination.name || 'Venezuela',
                                        rating: 5
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
