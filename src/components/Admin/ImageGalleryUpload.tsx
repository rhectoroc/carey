'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Loader2, Star, Image as ImageIcon } from 'lucide-react';
import styles from '../../app/admin/admin.module.css';
import { useNotification } from '@/components/UI/NotificationProvider';

interface ImageGalleryUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
    onSetMain?: (url: string) => void;
    maxImages?: number;
    maxVideos?: number; // 0 for none, -1 for unlimited
}

export default function ImageGalleryUpload({ images, onChange, onSetMain, maxImages = 6, maxVideos = 0 }: ImageGalleryUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const { showNotification } = useNotification();

    const handleFiles = useCallback(async (files: FileList) => {
        if (files.length === 0) return;

        const isVideo = (file: File) => file.type.startsWith('video/');
        const isImage = (file: File) => file.type.startsWith('image/');

        const currentVideos = images.filter(img => img.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/)).length;
        const currentImages = images.length - currentVideos;

        let incomingVideos = 0;
        let incomingImages = 0;

        for (let i = 0; i < files.length; i++) {
            if (isVideo(files[i])) incomingVideos++;
            else if (isImage(files[i])) incomingImages++;
        }

        // Validate Limits
        if (maxImages !== -1 && currentImages + incomingImages > maxImages) {
            showNotification('error', `Límite superado: Máximo ${maxImages} imágenes permitidas.`);
            return;
        }

        if (maxVideos !== -1 && currentVideos + incomingVideos > maxVideos) {
            showNotification('error', `Límite superado: Máximo ${maxVideos} video(s) permitidos.`);
            return;
        }

        if (maxImages + maxVideos !== -1 && images.length + files.length > maxImages + maxVideos && maxImages !== -1 && maxVideos !== -1) {
            // Fallback total limit if both are defined
        }

        setUploading(true);
        const newImages: string[] = [];
        let errors = 0;

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    newImages.push(data.url);
                } else {
                    errors++;
                }
            }

            if (newImages.length > 0) {
                onChange([...images, ...newImages]);
                showNotification('success', 'La carga de los archivos fue satisfactoria');
            }

            if (errors > 0) {
                showNotification('error', `${errors} archivos no pudieron subirse.`);
            }

        } catch (error) {
            showNotification('error', 'Error de red durante la subida.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [images, maxImages, onChange, showNotification]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFiles(e.target.files);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
        showNotification('info', 'Archivo eliminado de la galería.');
    };

    return (
        <div className={styles.uploadContainer}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept={`${maxImages !== 0 ? 'image/*,' : ''}${maxVideos !== 0 ? 'video/*' : ''}`}
                multiple
            />

            <div
                className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                {uploading ? (
                    <div className={styles.uploadStatus}>
                        <Loader2 className={styles.spinner} size={32} />
                        <p>Subiendo archivos...</p>
                    </div>
                ) : (
                    <div className={styles.uploadPrompt}>
                        <div className={styles.iconCircle}>
                            <Upload size={24} />
                        </div>
                        <p className={styles.primaryText}>Haga clic o arrastre sus archivos aquí</p>
                        <p className={styles.secondaryText}>
                            {maxImages > 0 && maxVideos > 0 && `Máx ${maxImages} imágenes y ${maxVideos} video`}
                            {maxImages > 0 && maxVideos === 0 && `Solo imágenes (Máx ${maxImages})`}
                            {maxImages === 0 && maxVideos > 0 && `Solo video (Máx ${maxVideos})`}
                        </p>
                    </div>
                )}
            </div>

            <div className={styles.galleryGrid} style={{ marginTop: '20px' }}>
                {images.map((img, idx) => {
                    const isVideo = img.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/);
                    return (
                        <div key={idx} className={styles.thumbnailContainer}>
                            {isVideo ? (
                                <video src={img} className={styles.thumbnail} muted />
                            ) : (
                                <img src={img} alt={`Gallery ${idx}`} className={styles.thumbnail} />
                            )}
                            <div className={styles.thumbnailActions}>
                                {onSetMain && !isVideo && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onSetMain(img); }}
                                        className={styles.mainAction}
                                    >
                                        <Star size={12} fill="currentColor" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                    className={styles.deleteAction}
                                >
                                    <X size={12} />
                                </button>
                            </div>
                            {isVideo && <span className={styles.videoBadge}>VIDEO</span>}
                        </div>
                    );
                })}
            </div>

            <div className={styles.uploadFooter}>
                <p>
                    {maxImages > 0 && `${images.filter(img => !img.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/)).length}/${maxImages} imágenes`}
                    {maxImages > 0 && maxVideos > 0 && ' | '}
                    {maxVideos > 0 && `${images.filter(img => img.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/)).length}/${maxVideos} videos`}
                </p>
            </div>

            <style jsx>{`
                .uploadContainer { width: 100%; }
            `}</style>
        </div>
    );
}
