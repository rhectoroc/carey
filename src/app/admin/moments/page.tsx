'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X, ArrowLeft, Camera, ExternalLink, Film } from 'lucide-react';
import { useNotification } from '@/components/UI/NotificationProvider';
import ImageGalleryUpload from '@/components/Admin/ImageGalleryUpload';

interface Moment {
    id: number;
    title: string;
    location: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    thumbnail_url: string;
    is_active: boolean;
    creator_name?: string;
}

export default function MomentsPage() {
    const [moments, setMoments] = useState<Moment[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
    const [currentMoment, setCurrentMoment] = useState<Partial<Moment>>({ is_active: true });
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchMoments();
    }, []);

    const fetchMoments = async () => {
        const res = await fetch('/api/admin/moments');
        if (res.ok) {
            const data = await res.json();
            setMoments(data);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!currentMoment.title || !currentMoment.video_url) {
            showNotification('error', 'Título y URL de video son requeridos.');
            setLoading(false);
            return;
        }

        const method = currentMoment.id ? 'PUT' : 'POST';
        const url = currentMoment.id ? `/api/admin/moments/${currentMoment.id}` : '/api/admin/moments';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentMoment),
            });

            if (res.ok) {
                showNotification('success', `✅ Momento "${currentMoment.title}" guardado!`);
                setViewMode('list');
                fetchMoments();
            } else {
                const err = await res.json();
                showNotification('error', `❌ Error: ${err.error}`);
            }
        } catch (error) {
            showNotification('error', '❌ Error de red.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este momento inolvidable?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/moments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showNotification('success', 'Momento eliminado.');
                fetchMoments();
            }
        } catch (error) {
            showNotification('error', 'Error al eliminar.');
        } finally {
            setLoading(false);
        }
    };

    const startCreate = () => {
        setCurrentMoment({ is_active: true, creator_name: '', thumbnail_url: '' });
        setViewMode('create');
    };

    const startEdit = (moment: Moment) => {
        setCurrentMoment(moment);
        setViewMode('edit');
    };

    if (viewMode === 'list') {
        return (
            <div>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Momentos Inolvidables</h1>
                    <button className={styles.actionButton} onClick={startCreate}>
                        <Plus size={18} /> Añadir Momento
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Thumbnail</th>
                                <th>Título</th>
                                <th>Ubicación</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moments.map((m) => (
                                <tr key={m.id}>
                                    <td>
                                        <img
                                            src={m.thumbnail_url || 'https://via.placeholder.com/80x45'}
                                            alt={m.title}
                                            style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    </td>
                                    <td>{m.title}</td>
                                    <td>{m.location}</td>
                                    <td>
                                        <span style={{ color: m.is_active ? 'green' : 'red', fontWeight: 'bold' }}>
                                            {m.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <Edit className={styles.actionIcon} size={18} onClick={() => startEdit(m)} />
                                        <Trash2 className={styles.actionIcon} size={18} onClick={() => handleDelete(m.id)} />
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
                    <button onClick={() => setViewMode('list')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className={styles.pageTitle}>
                        {viewMode === 'create' ? 'Añadir Momento' : 'Editar Momento'}
                    </h1>
                </div>
            </div>

            <div className={styles.modalForm} style={{ maxWidth: '800px', background: 'white', padding: '30px', borderRadius: '12px' }}>
                <form onSubmit={handleSave}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Título del Momento</label>
                        <input
                            className={styles.input}
                            value={currentMoment.title || ''}
                            onChange={(e) => setCurrentMoment({ ...currentMoment, title: e.target.value })}
                            placeholder="Ej: Atardecer en Playa El Agua"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nombre del Creador (Usuario/Influencer)</label>
                        <input
                            className={styles.input}
                            value={currentMoment.creator_name || ''}
                            onChange={(e) => setCurrentMoment({ ...currentMoment, creator_name: e.target.value })}
                            placeholder="Ej: @viajero_feliz"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Ubicación</label>
                        <input
                            className={styles.input}
                            value={currentMoment.location || ''}
                            onChange={(e) => setCurrentMoment({ ...currentMoment, location: e.target.value })}
                            placeholder="Ej: Margarita, Venezuela"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Descripción</label>
                        <textarea
                            className={styles.input}
                            style={{ minHeight: '100px' }}
                            value={currentMoment.description || ''}
                            onChange={(e) => setCurrentMoment({ ...currentMoment, description: e.target.value })}
                            placeholder="Breve descripción del momento..."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Video del Momento (Máx 1)</label>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Sube el video principal del momento.</p>
                            <ImageGalleryUpload
                                images={currentMoment.video_url ? [currentMoment.video_url] : []}
                                onChange={(media) => {
                                    const video = media.find(m => m.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/));
                                    setCurrentMoment({ ...currentMoment, video_url: video || '' });
                                }}
                                maxImages={0}
                                maxVideos={1}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Miniatura / Portada (Thumbnail)</label>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Imagen de portada que se mostrará antes de reproducir.</p>
                            <ImageGalleryUpload
                                images={currentMoment.thumbnail_url ? [currentMoment.thumbnail_url] : []}
                                onChange={(media) => {
                                    // Take the first image uploaded
                                    const image = media.find(m => !m.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/));
                                    setCurrentMoment({ ...currentMoment, thumbnail_url: image || '' });
                                }}
                                maxImages={1}
                                maxVideos={0}
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                checked={currentMoment.is_active}
                                onChange={(e) => setCurrentMoment({ ...currentMoment, is_active: e.target.checked })}
                            />
                            ¿Mostrar en la página principal?
                        </label>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelButton} onClick={() => setViewMode('list')}>Cancelar</button>
                        <button type="submit" className={styles.saveButton} disabled={loading}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
