'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X, ArrowLeft, Tag } from 'lucide-react';

import ImageGalleryUpload from '@/components/Admin/ImageGalleryUpload';
import ServiceCard from '@/components/Catalog/ServiceCard';

interface Tour {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    price_child?: number;
    price_infant?: number;
    price_valid_until?: string;
    duration: string;
    destination_id: number;
    destination_name?: string;
    image_url: string;
    gallery: string[]; // JSONB
    included: any; // JSONB
    tags: string[]; // JSONB
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

    // View State: 'list' | 'create' | 'edit'
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');

    const [currentTour, setCurrentTour] = useState<Partial<Tour>>({});
    const [loading, setLoading] = useState(false);
    const [includedInput, setIncludedInput] = useState('');
    const [tagInput, setTagInput] = useState('');

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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Verification
        if (!currentTour.name || !currentTour.destination_id) {
            alert('Verification Failed: Name and Destination are required.');
            setLoading(false);
            return;
        }

        const includedArray = includedInput.split(',').map(i => i.trim()).filter(i => i !== '');

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...currentTour, included: includedArray }),
            });

            if (res.ok) {
                const savedData = await res.json();
                alert(`✅ Tour "${savedData.name}" saved successfully!`);
                setViewMode('list');
                fetchTours();
            } else {
                const err = await res.json();
                console.error('Failed to save tour', err);
                alert(`❌ Error saving tour: ${err.error || 'Unknown'}`);
            }
        } catch (error) {
            console.error(error);
            alert('❌ Network Error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        setLoading(true);
        try {
            await fetch(`/api/admin/tours/${id}`, { method: 'DELETE' });
            fetchTours();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startCreate = () => {
        setCurrentTour({ is_featured: false, tags: [] });
        setIncludedInput('');
        setTagInput('');
        setViewMode('create');
    };

    const startEdit = (tour: Tour) => {
        setCurrentTour(tour);
        setIncludedInput(Array.isArray(tour.included) ? tour.included.join(', ') : '');
        setTagInput('');
        setViewMode('edit');
    };

    const addTag = () => {
        if (!tagInput.trim()) return;
        const currentTags = currentTour.tags || [];
        if (!currentTags.includes(tagInput.trim())) {
            setCurrentTour({ ...currentTour, tags: [...currentTags, tagInput.trim()] });
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = currentTour.tags || [];
        setCurrentTour({ ...currentTour, tags: currentTags.filter(t => t !== tagToRemove) });
    };

    // --- RENDER LIST ---
    if (viewMode === 'list') {
        return (
            <div>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Tours</h1>
                    <button className={styles.actionButton} onClick={startCreate}>
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
                                <th>Tags</th>
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
                                        {tour.tags && tour.tags.map(t => (
                                            <span key={t} style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '4px' }}>
                                                {t}
                                            </span>
                                        ))}
                                    </td>
                                    <td>
                                        <Edit className={styles.actionIcon} size={18} onClick={() => startEdit(tour)} />
                                        <Trash2 className={styles.actionIcon} size={18} onClick={() => handleDelete(tour.id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // --- RENDER FORM (FULL SCREEN) ---
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className={styles.pageHeader} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className={styles.pageTitle}>
                        {viewMode === 'create' ? 'Add Tour' : 'Edit Tour'}
                    </h1>
                </div>
            </div>

            <div className={styles.modalBodySplit} style={{ flex: 1, gap: '30px' }}> {/* Reusing split styles but in full page */}
                <div className={styles.modalForm} style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
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
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Included (comma separated)</label>
                            <textarea
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={includedInput}
                                onChange={(e) => setIncludedInput(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Tags</label>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add a tag..."
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <button type="button" onClick={addTag} className={styles.actionButton} style={{ padding: '0 15px' }}>Add</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {currentTour.tags?.map(tag => (
                                    <span key={tag} style={{ background: 'var(--color-primary-teal)', color: 'white', padding: '4px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                        {tag}
                                        <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Price (Adult)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentTour.price || ''}
                                    onChange={(e) => setCurrentTour({ ...currentTour, price: Number(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Price (Child 4-10)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentTour.price_child || ''}
                                    onChange={(e) => setCurrentTour({ ...currentTour, price_child: Number(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Price (Infant 0-3)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentTour.price_infant || ''}
                                    onChange={(e) => setCurrentTour({ ...currentTour, price_infant: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Price Valid Until</label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentTour.price_valid_until ? new Date(currentTour.price_valid_until).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setCurrentTour({ ...currentTour, price_valid_until: e.target.value })}
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
                                    required
                                />
                            </div>
                        </div>


                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Gallery (Max 6 images + 1 video)</label>
                            <ImageGalleryUpload
                                images={currentTour.gallery || []}
                                onChange={(newGallery) => setCurrentTour({ ...currentTour, gallery: newGallery })}
                                onSetMain={(url) => setCurrentTour({ ...currentTour, image_url: url })}
                                maxImages={7}
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
                                Promotion
                            </label>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.cancelButton} onClick={() => setViewMode('list')}>Cancel</button>
                            <button type="submit" className={styles.saveButton} disabled={loading}>Save</button>
                        </div>
                    </form>
                </div>

                <div className={styles.modalPreview} style={{ overflowY: 'auto', flex: 0.8, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
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
                            duration: currentTour.duration,
                            priceValidUntil: currentTour.price_valid_until,
                            tags: currentTour.tags
                        }}
                    />
                    <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666', width: '100%' }}>
                        <strong>Included:</strong>
                        <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                            {includedInput.split(',').filter(i => i.trim()).map((item, idx) => (
                                <li key={idx}>{item.trim()}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
