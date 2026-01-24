'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X, ArrowLeft, Tag } from 'lucide-react';
import ImageUpload from '@/components/Admin/ImageUpload';
import ImageGalleryUpload from '@/components/Admin/ImageGalleryUpload';
import ServiceCard from '@/components/Catalog/ServiceCard';

interface Transfer {
    id: number;
    name: string;
    slug: string;
    type: string; // terrestre, aereo, maritimo
    description?: string;
    price: number;
    capacity: number;
    destination_id: number;
    destination_name?: string;
    image_url?: string;
    gallery: string[];
    tags: string[];
    is_featured?: boolean;
    is_promotion?: boolean;
}

interface Destination {
    id: number;
    name: string;
}

export default function TransfersPage() {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);

    // View State
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');

    const [loading, setLoading] = useState(true);
    const [currentTransfer, setCurrentTransfer] = useState<Partial<Transfer>>({});
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        fetchTransfers();
        fetchDestinations();
    }, []);

    const fetchTransfers = async () => {
        try {
            const res = await fetch('/api/admin/transfers');
            if (res.ok) {
                const data = await res.json();
                setTransfers(data);
            }
        } catch (error) {
            console.error('Failed to fetch transfers', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDestinations = async () => {
        try {
            const res = await fetch('/api/admin/destinations');
            if (res.ok) {
                const data = await res.json();
                setDestinations(data);
            }
        } catch (error) {
            console.error('Failed to fetch destinations', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this transfer?')) return;
        try {
            await fetch(`/api/admin/transfers/${id}`, { method: 'DELETE' });
            fetchTransfers();
        } catch (error) {
            console.error('Error deleting transfer', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const method = currentTransfer.id ? 'PUT' : 'POST';
        const url = currentTransfer.id ? `/api/admin/transfers/${currentTransfer.id}` : '/api/admin/transfers';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentTransfer),
            });

            if (res.ok) {
                setViewMode('list');
                fetchTransfers();
            } else {
                alert('Failed to save transfer');
            }
        } catch (error) {
            console.error('Error saving transfer', error);
        } finally {
            setLoading(false);
        }
    };

    const startCreate = () => {
        setCurrentTransfer({ type: 'terrestre', tags: [], gallery: [] });
        setTagInput('');
        setViewMode('create');
    };

    const startEdit = (transfer: Transfer) => {
        setCurrentTransfer(transfer);
        setTagInput('');
        setViewMode('edit');
    };

    const addTag = () => {
        if (!tagInput.trim()) return;
        const currentTags = currentTransfer.tags || [];
        if (!currentTags.includes(tagInput.trim())) {
            setCurrentTransfer({ ...currentTransfer, tags: [...currentTags, tagInput.trim()] });
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = currentTransfer.tags || [];
        setCurrentTransfer({ ...currentTransfer, tags: currentTags.filter(t => t !== tagToRemove) });
    };

    if (viewMode === 'list') {
        return (
            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Traslados</h1>
                    <button className={styles.actionButton} onClick={startCreate}>
                        <Plus size={20} />
                        Add Transfer
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Destination</th>
                                <th>Price</th>
                                <th>Capacity</th>
                                <th>Tags</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.type}</td>
                                    <td>{item.destination_name}</td>
                                    <td>${item.price}</td>
                                    <td>{item.capacity}pax</td>
                                    <td>
                                        {item.tags && item.tags.map(t => (
                                            <span key={t} style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '4px' }}>
                                                {t}
                                            </span>
                                        ))}
                                    </td>
                                    <td>
                                        <Edit size={18} className={styles.actionIcon} onClick={() => startEdit(item)} />
                                        <Trash2 size={18} className={styles.actionIcon} onClick={() => handleDelete(item.id)} />
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
                        {viewMode === 'create' ? 'Add Transfer' : 'Edit Transfer'}
                    </h1>
                </div>
            </div>

            <div className={styles.modalBodySplit} style={{ flex: 1, gap: '30px' }}>
                <div className={styles.modalForm} style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleSave}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Name</label>
                            <input
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={currentTransfer.name || ''}
                                onChange={(e) => setCurrentTransfer({ ...currentTransfer, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Slug</label>
                            <input
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={currentTransfer.slug || ''}
                                onChange={(e) => setCurrentTransfer({ ...currentTransfer, slug: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Type</label>
                            <select
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={currentTransfer.type || 'terrestre'}
                                onChange={(e) => setCurrentTransfer({ ...currentTransfer, type: e.target.value })}
                                required
                            >
                                <option value="terrestre">Terrestre</option>
                                <option value="aereo">Aéreo</option>
                                <option value="maritimo">Marítimo</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Destination</label>
                            <select
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={currentTransfer.destination_id || ''}
                                onChange={(e) => {
                                    const destId = Number(e.target.value);
                                    const dest = destinations.find(d => d.id === destId);
                                    setCurrentTransfer({ ...currentTransfer, destination_id: destId, destination_name: dest?.name });
                                }}
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
                                    value={currentTransfer.price || ''}
                                    onChange={(e) => setCurrentTransfer({ ...currentTransfer, price: Number(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Capacity (Pax)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentTransfer.capacity || ''}
                                    onChange={(e) => setCurrentTransfer({ ...currentTransfer, capacity: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Description</label>
                            <textarea
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333', minHeight: '100px' }}
                                value={currentTransfer.description || ''}
                                onChange={(e) => setCurrentTransfer({ ...currentTransfer, description: e.target.value })}
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
                                {currentTransfer.tags?.map(tag => (
                                    <span key={tag} style={{ background: 'var(--color-primary-teal)', color: 'white', padding: '4px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                        {tag}
                                        <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Image / Video</label>
                            <ImageUpload
                                value={currentTransfer.image_url || ''}
                                onChange={(url) => setCurrentTransfer({ ...currentTransfer, image_url: url })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Gallery (Max 6)</label>
                            <ImageGalleryUpload
                                images={currentTransfer.gallery || []}
                                onChange={(newGallery) => setCurrentTransfer({ ...currentTransfer, gallery: newGallery })}
                                onSetMain={(url) => setCurrentTransfer({ ...currentTransfer, image_url: url })}
                            />
                        </div>

                        <div className={styles.formGroup} style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                                <input
                                    type="checkbox"
                                    checked={currentTransfer.is_featured || false}
                                    onChange={(e) => setCurrentTransfer({ ...currentTransfer, is_featured: e.target.checked })}
                                />
                                Featured
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e63946' }}>
                                <input
                                    type="checkbox"
                                    checked={currentTransfer.is_promotion || false}
                                    onChange={(e) => setCurrentTransfer({ ...currentTransfer, is_promotion: e.target.checked })}
                                />
                                Es Promoción
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
                            title: currentTransfer.name || 'Transfer Name',
                            category: 'Vehicle', // Mapped to Vehicle for now as it's closest
                            price: currentTransfer.price || 0,
                            image: currentTransfer.image_url || 'https://via.placeholder.com/400x300',
                            location: currentTransfer.destination_name || 'Destination',
                            rating: 5,
                            description: currentTransfer.description,
                            gallery: currentTransfer.gallery,
                            tags: currentTransfer.tags
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
