'use client';

import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Film } from 'lucide-react';
import styles from '../../app/admin/admin.module.css';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                onChange(data.url);
            } else {
                setError('Failed to upload image');
            }
        } catch (err) {
            setError('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.uploadContainer}>
            {value ? (
                <div className={styles.previewWrapper}>
                    {/* Simple check for extensions commonly used for video, though URL checking is brittle. 
                        Better would be to store type, but for now we visual check. */}
                    {value.endsWith('.mp4') || value.endsWith('.webm') ? (
                        <video src={value} className={styles.uploadedMedia} controls />
                    ) : (
                        <img src={value} alt="Uploaded" className={styles.uploadedMedia} />
                    )}

                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className={styles.removeBtn}
                        title="Remove"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <label className={styles.uploadLabel}>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                        hidden
                    />
                    <div className={styles.uploadPlaceholder}>
                        {uploading ? (
                            <span>Optimizing & Uploading...</span>
                        ) : (
                            <>
                                <Upload size={24} color="#666" />
                                <span>Click to Upload Photo/Video</span>
                                <small style={{ color: '#999' }}>JPG, PNG, WebP, MP4</small>
                            </>
                        )}
                    </div>
                </label>
            )}
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
}
