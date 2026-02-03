'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X, ArrowLeft, Tag } from 'lucide-react';
import { useNotification } from '@/components/UI/NotificationProvider';

import ImageGalleryUpload from '@/components/Admin/ImageGalleryUpload';
import ServiceCard from '@/components/Catalog/ServiceCard';
import ServiceModal from '@/components/Catalog/ServiceModal';
import { Service } from '@/data/mockServices';

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
    type: string;
    stars: number;
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
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const { showNotification } = useNotification();

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
            showNotification('error', 'Verificación fallida: Nombre y Destino son requeridos.');
            setLoading(false);
            return;
        }

        const includedArray = includedInput.split(',').map(i => i.trim()).filter(i => i !== '');

        const method = currentTour.id ? 'PUT' : 'POST';
        const url = currentTour.id ? `/api/admin/tours/${currentTour.id}` : '/api/admin/tours';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...currentTour,
                    included: includedArray,
                    stars: Number(currentTour.stars || 5),
                    price: Number(currentTour.price || 0)
                }),
            });

            if (res.ok) {
                const savedData = await res.json();
                showNotification('success', `✅ Tour "${savedData.name}" guardado exitosamente!`);
                setViewMode('list');
                fetchTours();
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

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este tour?')) return;
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
        setCurrentTour({ is_featured: false, tags: [], type: 'Aventura', stars: 5 });
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
                        <Plus size={18} /> Añadir Tour
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Destino</th>
                                <th>Tipo</th>
                                <th>Precio</th>
                                <th>Estrellas</th>
                                <th>Duración</th>
                                <th>Etiquetas</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tours.map((tour) => (
                                <tr key={tour.id}>
                                    <td>{tour.name}</td>
                                    <td>{tour.destination_name || '-'}</td>
                                    <td>{tour.type || 'Aventura'}</td>
                                    <td>${tour.price}</td>
                                    <td>{tour.stars} ★</td>
                                    <td>{tour.duration}</td>
                                    <td>
                                        {tour.tags && tour.tags.map(t => (
                                            <span key={t} style={{ background: '#e2e8f0', color: 'red', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '4px', fontWeight: 'bold' }}>
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
                        {viewMode === 'create' ? 'Añadir Tour' : 'Editar Tour'}
                    </h1>
                </div>
            </div>

            <div className={styles.modalBodySplit} style={{ flex: 1, gap: '30px' }}> {/* Reusing split styles but in full page */}
                <div className={styles.modalForm} style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleSave}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Nombre</label>
                            <input
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={currentTour.name || ''}
                                onChange={(e) => setCurrentTour({ ...currentTour, name: e.target.value })}
                                required
                            />
                        </div>
                        {/* Slug removed - handled automatically */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Destino</label>
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
                                    <option value="">Seleccionar Destino</option>
                                    {destinations.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Tipo</label>
                                <select
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentTour.type || 'Aventura'}
                                    onChange={(e) => setCurrentTour({ ...currentTour, type: e.target.value })}
                                    required
                                >
                                    <option value="Aventura">Aventura</option>
                                    <option value="Navegacion">Navegacion</option>
                                    <option value="Playa">Playa</option>
                                    <option value="Montaña">Montaña</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Descripción</label>
                            <textarea
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333', minHeight: '100px' }}
                                value={currentTour.description || ''}
                                onChange={(e) => setCurrentTour({ ...currentTour, description: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Incluye (separado por comas)</label>
                            <textarea
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={includedInput}
                                onChange={(e) => setIncludedInput(e.target.value)}
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
                                {currentTour.tags?.map(tag => (
                                    <span key={tag} style={{ background: 'white', border: '1px solid red', color: 'red', padding: '4px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        {tag}
                                        <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Precio (Adulto)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentTour.price || ''}
                                    onChange={(e) => setCurrentTour({ ...currentTour, price: Number(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Precio (Niño 4-10)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentTour.price_child || ''}
                                    onChange={(e) => setCurrentTour({ ...currentTour, price_child: Number(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Precio (Bebé 0-3)</label>
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
                                <label className={styles.label} style={{ color: '#333' }}>Precio Válido Hasta</label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentTour.price_valid_until ? new Date(currentTour.price_valid_until).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setCurrentTour({ ...currentTour, price_valid_until: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Duración (Texto)</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentTour.duration || ''}
                                    onChange={(e) => setCurrentTour({ ...currentTour, duration: e.target.value })}
                                    placeholder="e.g. 1 día / 8 horas"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Estrellas (1-5)</label>
                                <input
                                    type="number"
                                    min="1" max="5"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentTour.stars || ''}
                                    onChange={(e) => setCurrentTour({ ...currentTour, stars: Number(e.target.value) })}
                                />
                            </div>
                        </div>


                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Galería (Máx 6 imágenes + 1 video)</label>
                            <ImageGalleryUpload
                                images={currentTour.gallery || []}
                                onChange={(newGallery) => setCurrentTour({ ...currentTour, gallery: newGallery })}
                                onSetMain={(url) => setCurrentTour({ ...currentTour, image_url: url })}
                                maxImages={6}
                                maxVideos={1}
                            />
                        </div>
                        <div className={styles.formGroup} style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                                <input
                                    type="checkbox"
                                    checked={currentTour.is_featured || false}
                                    onChange={(e) => setCurrentTour({ ...currentTour, is_featured: e.target.checked })}
                                />
                                Destacado
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e63946' }}>
                                <input
                                    type="checkbox"
                                    checked={currentTour.is_promotion || false}
                                    onChange={(e) => setCurrentTour({ ...currentTour, is_promotion: e.target.checked })}
                                />
                                Promoción
                            </label>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.cancelButton} onClick={() => setViewMode('list')}>Cancelar</button>
                            <button type="submit" className={styles.saveButton} disabled={loading}>Guardar</button>
                        </div>
                    </form>
                </div>

                <div className={styles.modalPreview} style={{ overflowY: 'auto', flex: 0.8, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <div className={styles.modalPreviewTitle}>Vista Previa</div>
                    <ServiceCard
                        service={{
                            id: 'preview',
                            title: currentTour.name || 'Nombre del Tour',
                            category: currentTour.type || 'Aventura',
                            price: currentTour.price || 0,
                            image: currentTour.image_url || 'https://via.placeholder.com/400x300',
                            location: currentTour.destination_name || 'Destino',
                            rating: currentTour.stars || 5,
                            duration: currentTour.duration,
                            priceValidUntil: currentTour.price_valid_until,
                            tags: currentTour.tags,
                            is_featured: currentTour.is_featured,
                            is_promotion: currentTour.is_promotion
                        } as Service}
                        onClick={() => setIsPreviewModalOpen(true)}
                        style={{ opacity: 1 }}
                    />
                    <button
                        type="button"
                        onClick={() => setIsPreviewModalOpen(true)}
                        className={styles.actionButton}
                        style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
                    >
                        Ver Vista Completa (Modal)
                    </button>
                    <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666', width: '100%' }}>
                        <strong>Incluido:</strong>
                        <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                            {includedInput.split(',').filter(i => i.trim()).map((item, idx) => (
                                <li key={idx}>{item.trim()}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div >

            <ServiceModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                service={{
                    id: 'preview',
                    title: currentTour.name || 'Tour Name',
                    category: currentTour.type || 'Full Day',
                    price: currentTour.price || 0,
                    image: currentTour.image_url || 'https://via.placeholder.com/400x300',
                    location: currentTour.destination_name || 'Destination',
                    rating: currentTour.stars || 5,
                    duration: currentTour.duration,
                    priceValidUntil: currentTour.price_valid_until,
                    gallery: currentTour.gallery,
                    tags: currentTour.tags,
                    description: currentTour.description,
                    features: includedInput.split(',').filter(i => i.trim()),
                    price_child: currentTour.price_child,
                    price_infant: currentTour.price_infant,
                    is_featured: currentTour.is_featured,
                    is_promotion: currentTour.is_promotion
                } as Service}
            />
        </div>
    );
}
