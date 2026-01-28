'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X, ArrowLeft, Tag } from 'lucide-react';
import { useNotification } from '@/components/UI/NotificationProvider';

import ImageGalleryUpload from '@/components/Admin/ImageGalleryUpload';
import ServiceCard from '@/components/Catalog/ServiceCard';

interface Destination {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    gallery: string[];
    tags: string[];
    is_featured: boolean;
    is_promotion: boolean;
    type: string;
}

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);

    // View State: 'list' | 'create' | 'edit'
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');

    const [currentDestination, setCurrentDestination] = useState<Partial<Destination>>({});
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const { showNotification } = useNotification();

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
        if (confirm('¿Estás seguro de que deseas eliminar este destino?')) {
            const res = await fetch(`/api/admin/destinations/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchDestinations();
                showNotification('success', 'Destino eliminado correctamente.');
            } else {
                showNotification('error', 'Error al eliminar el destino.');
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Verification
        if (!currentDestination.name) {
            showNotification('error', 'Verificación fallida: El nombre es obligatorio.');
            setLoading(false);
            return;
        }

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
                const savedData = await res.json();
                showNotification('success', `✅ Destino "${savedData.name}" guardado exitosamente!`);
                setViewMode('list');
                fetchDestinations();
            } else {
                const err = await res.json();
                showNotification('error', '❌ Error al guardar: ' + (err.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error(error);
            showNotification('error', '❌ Error de red.');
        } finally {
            setLoading(false);
        }
    };

    const startCreate = () => {
        setCurrentDestination({ is_featured: false, tags: [], gallery: [], type: 'Ciudad' });
        setTagInput('');
        setViewMode('create');
    };

    const startEdit = (dest: Destination) => {
        setCurrentDestination(dest);
        setTagInput('');
        setViewMode('edit');
    };

    const addTag = () => {
        if (!tagInput.trim()) return;
        const currentTags = currentDestination.tags || [];
        if (!currentTags.includes(tagInput.trim())) {
            setCurrentDestination({ ...currentDestination, tags: [...currentTags, tagInput.trim()] });
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = currentDestination.tags || [];
        setCurrentDestination({ ...currentDestination, tags: currentTags.filter(t => t !== tagToRemove) });
    };

    if (viewMode === 'list') {
        return (
            <div>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Destinos</h1>
                    <button className={styles.actionButton} onClick={startCreate}>
                        <Plus size={18} /> Añadir Destino
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Slug</th>
                                <th>Tipo</th>
                                <th>Destacado</th>
                                <th>Etiquetas</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {destinations.map((dest) => (
                                <tr key={dest.id}>
                                    <td>{dest.name}</td>
                                    <td>{dest.slug}</td>
                                    <td>{dest.type || 'Ciudad'}</td>
                                    <td>{dest.is_featured ? 'Sí' : 'No'}</td>
                                    <td>
                                        {dest.tags && dest.tags.map(t => (
                                            <span key={t} style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '4px' }}>
                                                {t}
                                            </span>
                                        ))}
                                    </td>
                                    <td>
                                        <Edit
                                            className={styles.actionIcon}
                                            size={18}
                                            onClick={() => startEdit(dest)}
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
                        {viewMode === 'create' ? 'Añadir Destino' : 'Editar Destino'}
                    </h1>
                </div>
            </div>

            <div className={styles.modalBodySplit} style={{ flex: 1, gap: '30px' }}>
                {/* Form */}
                <div className={styles.modalForm} style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleSave}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Nombre</label>
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
                            <label className={styles.label} style={{ color: '#333' }}>Tipo</label>
                            <select
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={currentDestination.type || 'Ciudad'}
                                onChange={(e) => setCurrentDestination({ ...currentDestination, type: e.target.value })}
                                required
                            >
                                <option value="Ciudad">Ciudad</option>
                                <option value="Isla">Isla</option>
                                <option value="Parque Nacional">Parque Nacional</option>
                                <option value="Playa">Playa</option>
                                <option value="Montaña">Montaña</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Descripción</label>
                            <textarea
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333', minHeight: '100px' }}
                                value={currentDestination.description || ''}
                                onChange={(e) => setCurrentDestination({ ...currentDestination, description: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Etiquetas</label>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Añadir etiqueta..."
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <button type="button" onClick={addTag} className={styles.actionButton} style={{ padding: '0 15px' }}>Añadir</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {currentDestination.tags?.map(tag => (
                                    <span key={tag} style={{ background: 'var(--color-primary-teal)', color: 'white', padding: '4px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                        {tag}
                                        <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                                    </span>
                                ))}
                            </div>
                        </div>



                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Galería (Máx 6 imágenes + 1 video)</label>
                            <ImageGalleryUpload
                                images={currentDestination.gallery || []}
                                onChange={(newGallery) => setCurrentDestination({ ...currentDestination, gallery: newGallery })}
                                onSetMain={(url) => setCurrentDestination({ ...currentDestination, image_url: url })}
                                maxImages={7}
                            />
                        </div>

                        <div className={styles.formGroup} style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                                <input
                                    type="checkbox"
                                    checked={currentDestination.is_featured || false}
                                    onChange={(e) => setCurrentDestination({ ...currentDestination, is_featured: e.target.checked })}
                                />
                                Destacado
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e63946' }}>
                                <input
                                    type="checkbox"
                                    checked={currentDestination.is_promotion || false}
                                    onChange={(e) => setCurrentDestination({ ...currentDestination, is_promotion: e.target.checked })}
                                />
                                Promoción
                            </label>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.cancelButton} onClick={() => setViewMode('list')}>Cancelar</button>
                            <button type="submit" className={styles.saveButton} disabled={loading}>
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview */}
                <div className={styles.modalPreview} style={{ overflowY: 'auto', flex: 0.8, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <div className={styles.modalPreviewTitle}>Vista Previa</div>
                    <ServiceCard
                        service={{
                            id: 'preview',
                            title: currentDestination.name || 'Destino',
                            category: currentDestination.type || 'Ciudad',
                            price: 0, // Destinations often don't have a single price, or add one if needed
                            image: currentDestination.image_url || 'https://via.placeholder.com/400x300',
                            location: currentDestination.name || 'Venezuela',
                            rating: 5,
                            gallery: currentDestination.gallery,
                            tags: currentDestination.tags
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
