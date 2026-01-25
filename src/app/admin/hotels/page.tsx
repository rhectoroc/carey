'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X, ArrowLeft, Tag } from 'lucide-react';
import { useNotification } from '@/components/UI/NotificationProvider';

import ImageGalleryUpload from '@/components/Admin/ImageGalleryUpload';
import ServiceCard from '@/components/Catalog/ServiceCard';
import ServiceModal from '@/components/Catalog/ServiceModal';
import { Service } from '@/data/mockServices';

interface Hotel {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    price_child?: number;
    price_infant?: number;
    destination_id: number;
    destination_name?: string;
    image_url: string;
    stars: number;
    features: any; // JSONB
    gallery: string[]; // JSONB
    tags: string[]; // JSONB
    is_featured: boolean;
    is_promotion?: boolean;
    type?: string;
}

interface Destination {
    id: number;
    name: string;
}

export default function HotelsPage() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);

    // View State: 'list' | 'create' | 'edit'
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');

    const [currentHotel, setCurrentHotel] = useState<Partial<Hotel>>({});
    const [loading, setLoading] = useState(false);
    const [featuresInput, setFeaturesInput] = useState(''); // Keep as comma-separated string for input
    const [tagInput, setTagInput] = useState('');
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const { showNotification } = useNotification();

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

        // --- VERIFICATION PROTOCOL ---
        if (!currentHotel.name || !currentHotel.destination_id) {
            showNotification('error', 'Verificación fallida: Nombre y Destino son requeridos.');
            setLoading(false);
            return;
        }

        const featuresArray = featuresInput.split(',').map(f => f.trim()).filter(f => f);
        const finalGallery = currentHotel.gallery || [];

        // Log for debugging
        console.log('Saving Hotel:', { name: currentHotel.name, galleryCount: finalGallery.length });

        const payload = {
            ...currentHotel,
            features: featuresArray,
            price: Number(currentHotel.price),
            stars: Number(currentHotel.stars),
            destination_id: Number(currentHotel.destination_id),
            gallery: finalGallery
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
                const savedData = await res.json();
                showNotification('success', `✅ Hotel "${savedData.name}" guardado exitosamente!`);
                setViewMode('list');
                fetchHotels();
            } else {
                const err = await res.json();
                showNotification('error', `❌ Error al guardar: ${err.error || 'Error desconocido'}`);
            }
        } catch (error) {
            showNotification('error', '❌ Error de red. Por favor intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const startCreate = () => {
        setCurrentHotel({ is_featured: false, stars: 3, tags: [], gallery: [] });
        setFeaturesInput('');
        setTagInput('');
        setViewMode('create');
    };

    const startEdit = (hotel: Hotel) => {
        setCurrentHotel(hotel);
        setFeaturesInput(Array.isArray(hotel.features) ? hotel.features.join(', ') : '');
        setTagInput('');
        setViewMode('edit');
    };

    const addTag = () => {
        if (!tagInput.trim()) return;
        const currentTags = currentHotel.tags || [];
        if (!currentTags.includes(tagInput.trim())) {
            setCurrentHotel({ ...currentHotel, tags: [...currentTags, tagInput.trim()] });
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = currentHotel.tags || [];
        setCurrentHotel({ ...currentHotel, tags: currentTags.filter(t => t !== tagToRemove) });
    };

    if (viewMode === 'list') {
        return (
            <div>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Hotels</h1>
                    <button className={styles.actionButton} onClick={startCreate}>
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
                                <th>Type</th>
                                <th>Tags</th>
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
                                    <td>{hotel.type || 'Hotel'}</td>
                                    <td>
                                        {hotel.tags && hotel.tags.map(t => (
                                            <span key={t} style={{ background: '#e2e8f0', color: 'red', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '4px', fontWeight: 'bold' }}>
                                                {t}
                                            </span>
                                        ))}
                                    </td>
                                    <td>
                                        <Edit
                                            className={styles.actionIcon}
                                            size={18}
                                            onClick={() => startEdit(hotel)}
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
            </div>
        );
    }

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
                        {viewMode === 'create' ? 'Add Hotel' : 'Edit Hotel'}
                    </h1>
                </div>
            </div>

            <div className={styles.modalBodySplit} style={{ flex: 1, gap: '30px' }}>
                {/* Form Section */}
                <div className={styles.modalForm} style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
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
                            <label className={styles.label} style={{ color: '#333' }}>Type</label>
                            <select
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={currentHotel.type || 'Hotel'}
                                onChange={(e) => setCurrentHotel({ ...currentHotel, type: e.target.value })}
                                required
                            >
                                <option value="Hotel">Hotel</option>
                                <option value="Posada">Posada</option>
                                <option value="Campamento">Campamento</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Destination</label>
                            <select
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={currentHotel.destination_id || ''}
                                onChange={(e) => {
                                    const destId = Number(e.target.value);
                                    const dest = destinations.find(d => d.id === destId);
                                    setCurrentHotel({ ...currentHotel, destination_id: destId, destination_name: dest?.name });
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
                                value={currentHotel.description || ''}
                                onChange={(e) => setCurrentHotel({ ...currentHotel, description: e.target.value })}
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
                                {currentHotel.tags?.map(tag => (
                                    <span key={tag} style={{ background: 'white', border: '1px solid red', color: 'red', padding: '4px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 'bold' }}>
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
                                    value={currentHotel.price || ''}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, price: Number(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Price (Child 4-10)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentHotel.price_child || ''}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, price_child: Number(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Price (Infant 0-3)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentHotel.price_infant || ''}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, price_infant: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
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
                            <label className={styles.label} style={{ color: '#333' }}>Gallery (Max 6 images + 1 video)</label>
                            <ImageGalleryUpload
                                images={currentHotel.gallery || []}
                                onChange={(newGallery) => setCurrentHotel({ ...currentHotel, gallery: newGallery })}
                                onSetMain={(url) => setCurrentHotel({ ...currentHotel, image_url: url })}
                                maxImages={7}
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
                                Promotion
                            </label>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.cancelButton} onClick={() => setViewMode('list')}>Cancel</button>
                            <button type="submit" className={styles.saveButton} disabled={loading}>Save</button>
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                <div className={styles.modalPreview} style={{ overflowY: 'auto', flex: 0.8, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <div className={styles.modalPreviewTitle}>Live Preview</div>
                    <ServiceCard
                        service={{
                            id: 'preview',
                            title: currentHotel.name || 'Hotel Name',
                            category: currentHotel.type || 'Hotel',
                            price: currentHotel.price || 0,
                            image: currentHotel.image_url || 'https://via.placeholder.com/400x300',
                            location: currentHotel.destination_name || 'Location',
                            rating: currentHotel.stars || 0,
                            gallery: currentHotel.gallery,
                            features: featuresInput.split(',').filter(f => f.trim()),
                            tags: currentHotel.tags
                        } as Service}
                        onClick={() => setIsPreviewModalOpen(true)}
                    />
                    <button
                        type="button"
                        onClick={() => setIsPreviewModalOpen(true)}
                        className={styles.actionButton}
                        style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
                    >
                        Ver Vista Completa (Modal)
                    </button>
                </div>
            </div>

            <ServiceModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                service={{
                    id: 'preview',
                    title: currentHotel.name || 'Hotel Name',
                    category: currentHotel.type || 'Hotel',
                    price: currentHotel.price || 0,
                    image: currentHotel.image_url || 'https://via.placeholder.com/400x300',
                    location: currentHotel.destination_name || 'Location',
                    rating: currentHotel.stars || 0,
                    gallery: currentHotel.gallery,
                    features: featuresInput.split(',').filter(f => f.trim()),
                    tags: currentHotel.tags,
                    description: currentHotel.description,
                    price_child: currentHotel.price_child,
                    price_infant: currentHotel.price_infant
                } as Service}
            />
        </div>
    );
}
