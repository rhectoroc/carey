'use client';

import React, { useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import styles from './ImageUpload.module.css'; // Reusing styles

interface ImageGalleryUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
}

export default function ImageGalleryUpload({ images, onChange, maxImages = 6 }: ImageGalleryUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = React.useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (images.length + files.length > maxImages) {
            alert(`You can only upload up to ${maxImages} images.`);
            return;
        }

        setUploading(true);
        const newImages: string[] = [];

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
                    console.error('Failed to upload', file.name);
                }
            }
            onChange([...images, ...newImages]);
        } catch (error) {
            console.error('Upload error', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    return (
        <div className={styles.uploadContainer}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
                multiple
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                        <img src={img} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            width: '100px',
                            height: '100px',
                            border: '2px dashed #cbd5e1',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#64748b',
                            backgroundColor: '#f8fafc'
                        }}
                    >
                        {uploading ? <Loader2 className={styles.spinner} size={24} /> : <Upload size={24} />}
                        <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Add Image</span>
                    </div>
                )}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                {images.length} / {maxImages} images
            </p>
        </div>
    );
}
