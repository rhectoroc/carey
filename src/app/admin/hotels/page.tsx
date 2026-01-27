'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X, ArrowLeft, Tag } from 'lucide-react';
import { useNotification } from '@/components/UI/NotificationProvider';

import ImageGalleryUpload from '@/components/Admin/ImageGalleryUpload';
import ServiceCard from '@/components/Catalog/ServiceCard';
import ServiceModal from '@/components/Catalog/ServiceModal';
import { Service } from '@/data/mockServices';
import { slugify } from '@/lib/slugify';

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
    room_types?: string[];
    occupancies?: string[];
    plan_types?: string[];
    pricing_matrix?: { room_type: string; occupancy: string; plan_type: string; price: number }[];
    show_price_publicly?: boolean;
    price_valid_until?: string;
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
        if (confirm('¿Estás seguro de que quieres eliminar este hotel?')) {
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
        const autoSlug = slugify(currentHotel.name || '');

        // Log for debugging
        console.log('Saving Hotel:', { name: currentHotel.name, slug: autoSlug, galleryCount: finalGallery.length });

        const payload = {
            ...currentHotel,
            slug: autoSlug,
            features: featuresArray,
            price: Number(currentHotel.price),
            stars: Number(currentHotel.stars),
            destination_id: Number(currentHotel.destination_id),
            gallery: finalGallery,
            pricing_matrix: currentHotel.pricing_matrix || [],
            show_price_publicly: currentHotel.show_price_publicly ?? true,
            price_valid_until: currentHotel.price_valid_until || null
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
                    <h1 className={styles.pageTitle}>Hoteles</h1>
                    <button className={styles.actionButton} onClick={startCreate}>
                        <Plus size={18} /> Añadir Hotel
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Destino</th>
                                <th>Precio</th>
                                <th>Estrellas</th>
                                <th>Tipo</th>
                                <th>Etiquetas</th>
                                <th>Acciones</th>
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
                        {viewMode === 'create' ? 'Añadir Hotel' : 'Editar Hotel'}
                    </h1>
                </div>
            </div>

            <div className={styles.modalBodySplit} style={{ flex: 1, gap: '30px' }}>
                {/* Form Section */}
                <div className={styles.modalForm} style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleSave}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Nombre</label>
                            <input
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={currentHotel.name || ''}
                                onChange={(e) => setCurrentHotel({ ...currentHotel, name: e.target.value })}
                                required
                            />
                        </div>
                        {/* Slug removed - handled automatically */}
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Tipo</label>
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
                            <label className={styles.label} style={{ color: '#333' }}>Destino</label>
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
                                <option value="">Seleccionar Destino</option>
                                {destinations.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Descripción</label>
                            <textarea
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333', minHeight: '100px' }}
                                value={currentHotel.description || ''}
                                onChange={(e) => setCurrentHotel({ ...currentHotel, description: e.target.value })}
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
                                <label className={styles.label} style={{ color: '#333' }}>Precio (Adulto)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentHotel.price || ''}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, price: Number(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Precio (Niño 4-10)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentHotel.price_child || ''}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, price_child: Number(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333' }}>Precio (Bebé 0-3)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentHotel.price_infant || ''}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, price_infant: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333', fontWeight: 'bold' }}>Tipos de Habitación</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                    {['Standard', 'Family', 'Luxury'].map(type => (
                                        <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={currentHotel.room_types?.includes(type) || false}
                                                onChange={(e) => {
                                                    const current = currentHotel.room_types || [];
                                                    const updated = e.target.checked
                                                        ? [...current, type]
                                                        : current.filter(t => t !== type);
                                                    setCurrentHotel({ ...currentHotel, room_types: updated });
                                                }}
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333', fontWeight: 'bold' }}>Ocupación</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                    {['Sencilla', 'Doble', 'Triple', 'Cuadruble', 'Niños'].map(occ => (
                                        <label key={occ} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={currentHotel.occupancies?.includes(occ) || false}
                                                onChange={(e) => {
                                                    const current = currentHotel.occupancies || [];
                                                    const updated = e.target.checked
                                                        ? [...current, occ]
                                                        : current.filter(o => o !== occ);
                                                    setCurrentHotel({ ...currentHotel, occupancies: updated });
                                                }}
                                            />
                                            {occ}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} style={{ color: '#333', fontWeight: 'bold' }}>Tipo de Plan</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                    {['Todo incluido', 'Solo desayunos', 'Desayunos y cena', 'Solo alojamiento'].map(plan => (
                                        <label key={plan} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={currentHotel.plan_types?.includes(plan) || false}
                                                onChange={(e) => {
                                                    const current = currentHotel.plan_types || [];
                                                    const updated = e.target.checked
                                                        ? [...current, plan]
                                                        : current.filter(p => p !== plan);
                                                    setCurrentHotel({ ...currentHotel, plan_types: updated });
                                                }}
                                            />
                                            {plan}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}>
                                <input
                                    type="checkbox"
                                    checked={currentHotel.show_price_publicly ?? true}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, show_price_publicly: e.target.checked })}
                                />
                                Mostrar precio públicamente
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ fontWeight: 'bold', color: '#333' }}>Precio válido hasta:</label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    style={{ width: 'auto', background: 'white' }}
                                    value={currentHotel.price_valid_until ? new Date(currentHotel.price_valid_until).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, price_valid_until: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ marginBottom: '30px' }}>
                            <label className={styles.label} style={{ color: '#333', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px', display: 'block' }}>Cuadro de Precios (Matrix)</label>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #ddd' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                            <th style={{ padding: '10px' }}>Habitación</th>
                                            <th style={{ padding: '10px' }}>Ocupación</th>
                                            <th style={{ padding: '10px' }}>Plan</th>
                                            <th style={{ padding: '10px' }}>Precio ($)</th>
                                            <th style={{ padding: '10px', width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(currentHotel.pricing_matrix || []).map((row, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '5px' }}>
                                                    <select
                                                        className={styles.input}
                                                        value={row.room_type}
                                                        onChange={(e) => {
                                                            const newMatrix = [...(currentHotel.pricing_matrix || [])];
                                                            newMatrix[index].room_type = e.target.value;
                                                            setCurrentHotel({ ...currentHotel, pricing_matrix: newMatrix });
                                                        }}
                                                    >
                                                        <option value="">Seleccionar</option>
                                                        {['Standard', 'Family', 'Luxury'].map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '5px' }}>
                                                    <select
                                                        className={styles.input}
                                                        value={row.occupancy}
                                                        onChange={(e) => {
                                                            const newMatrix = [...(currentHotel.pricing_matrix || [])];
                                                            newMatrix[index].occupancy = e.target.value;
                                                            setCurrentHotel({ ...currentHotel, pricing_matrix: newMatrix });
                                                        }}
                                                    >
                                                        <option value="">Seleccionar</option>
                                                        {['Sencilla', 'Doble', 'Triple', 'Cuadruble', 'Niños'].map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '5px' }}>
                                                    <select
                                                        className={styles.input}
                                                        value={row.plan_type}
                                                        onChange={(e) => {
                                                            const newMatrix = [...(currentHotel.pricing_matrix || [])];
                                                            newMatrix[index].plan_type = e.target.value;
                                                            setCurrentHotel({ ...currentHotel, pricing_matrix: newMatrix });
                                                        }}
                                                    >
                                                        <option value="">Seleccionar</option>
                                                        {['Todo incluido', 'Solo desayunos', 'Desayunos y cena', 'Solo alojamiento'].map(p => <option key={p} value={p}>{p}</option>)}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '5px' }}>
                                                    <input
                                                        type="number"
                                                        className={styles.input}
                                                        value={row.price}
                                                        onChange={(e) => {
                                                            const newMatrix = [...(currentHotel.pricing_matrix || [])];
                                                            newMatrix[index].price = Number(e.target.value);
                                                            setCurrentHotel({ ...currentHotel, pricing_matrix: newMatrix });
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '5px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newMatrix = (currentHotel.pricing_matrix || []).filter((_, i) => i !== index);
                                                            setCurrentHotel({ ...currentHotel, pricing_matrix: newMatrix });
                                                        }}
                                                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer' }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button
                                    type="button"
                                    className={styles.actionButton}
                                    onClick={() => {
                                        const newMatrix = [...(currentHotel.pricing_matrix || []), { room_type: '', occupancy: '', plan_type: '', price: 0 }];
                                        setCurrentHotel({ ...currentHotel, pricing_matrix: newMatrix });
                                    }}
                                    style={{ width: '100%', justifyContent: 'center', gap: '10px' }}
                                >
                                    <Plus size={18} /> Añadir Fila de Precio
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'none' }}> {/* Keeping old fields hidden to avoid breaking layout for now if needed, but matrix is primary */}
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
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333', fontWeight: 'bold' }}>Estrellas (1-5)</label>
                            <input
                                type="number"
                                min="1" max="5"
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={currentHotel.stars || ''}
                                onChange={(e) => setCurrentHotel({ ...currentHotel, stars: Number(e.target.value) })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Características (separadas por coma)</label>
                            <input
                                className={styles.input}
                                style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                value={featuresInput}
                                onChange={(e) => setFeaturesInput(e.target.value)}
                                placeholder="Wifi, Piscina, Spa"
                            />
                        </div>



                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#333' }}>Galería (Máx 6 imágenes + 1 video)</label>
                            <ImageGalleryUpload
                                images={currentHotel.gallery || []}
                                onChange={(newGallery) => setCurrentHotel({ ...currentHotel, gallery: newGallery })}
                                onSetMain={(url) => setCurrentHotel({ ...currentHotel, image_url: url })}
                                maxImages={6}
                                maxVideos={1}
                            />
                        </div>

                        <div className={styles.formGroup} style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                                <input
                                    type="checkbox"
                                    checked={currentHotel.is_featured || false}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, is_featured: e.target.checked })}
                                />
                                Destacado
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e63946' }}>
                                <input
                                    type="checkbox"
                                    checked={currentHotel.is_promotion || false}
                                    onChange={(e) => setCurrentHotel({ ...currentHotel, is_promotion: e.target.checked })}
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

                {/* Preview Section */}
                <div className={styles.modalPreview} style={{ overflowY: 'auto', flex: 0.8, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <div className={styles.modalPreviewTitle}>Vista Previa</div>
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
                            tags: currentHotel.tags,
                            is_featured: currentHotel.is_featured,
                            is_promotion: currentHotel.is_promotion
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
                    price_infant: currentHotel.price_infant,
                    is_featured: currentHotel.is_featured,
                    is_promotion: currentHotel.is_promotion
                } as Service}
            />
        </div>
    );
}
