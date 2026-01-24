'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import ImageUpload from '@/components/Admin/ImageUpload';
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
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTransfer, setCurrentTransfer] = useState<Partial<Transfer>>({});

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

    const handleEdit = (transfer: Transfer) => {
        setCurrentTransfer(transfer);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentTransfer({ type: 'terrestre' });
        setIsModalOpen(true);
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
                setIsModalOpen(false);
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

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Traslados</h1>
                <button className={styles.actionButton} onClick={handleCreate}>
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
                                    <Edit size={18} className={styles.actionIcon} onClick={() => handleEdit(item)} />
                                    <Trash2 size={18} className={styles.actionIcon} onClick={() => handleDelete(item.id)} />
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
                                {currentTransfer.id ? 'Edit Transfer' : 'Add Transfer'}
                            </h2>
                            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalBodySplit}>
                            <div className={styles.modalForm}>
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
                                        <label className={styles.label} style={{ color: '#333' }}>Image / Video</label>
                                        <ImageUpload
                                            value={currentTransfer.image_url || ''}
                                            onChange={(url) => setCurrentTransfer({ ...currentTransfer, image_url: url })}
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
                                        <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                        <button type="submit" className={styles.saveButton} disabled={loading}>Save</button>
                                    </div>
                                </form>
                            </div>

                            <div className={styles.modalPreview}>
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
                                        description: currentTransfer.description
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
