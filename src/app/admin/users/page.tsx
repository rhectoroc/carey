'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Plus, Edit, Trash2, X, User } from 'lucide-react';

interface UserData {
    id: number;
    username: string;
    role: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password?: string; // Only for creating/updating
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<UserData>>({});
    const [adminUser, setAdminUser] = useState<{ role: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                setAdminUser(data);
                if (data.role === 'administrador') {
                    fetchUsers();
                } else {
                    setError('Acceso Denegado: No tienes permisos para gestionar usuarios.');
                }
            })
            .catch(() => setError('Error de autenticación'));
    }, []);

    const fetchUsers = async () => {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        } else {
            // If unauthorized (e.g. non-admin tries to access), redirect or show error
            // mostly handled by middleware/api, but good to handle UI feedback
            setError('Unauthorized or Failed to load');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUsers();
            } else {
                alert('Failed to delete');
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const method = currentUser.id ? 'PUT' : 'POST';
        const url = currentUser.id
            ? `/api/admin/users/${currentUser.id}`
            : '/api/admin/users';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentUser),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchUsers();
            } else {
                const err = await res.json();
                alert('Failed to save: ' + (err.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (user?: UserData) => {
        if (user) {
            setCurrentUser({ ...user, password: '' }); // Don't show hash, allow reset
        } else {
            setCurrentUser({ role: 'empleado' });
        }
        setIsModalOpen(true);
    };

    if (error) return <div className={styles.pageHeader}>{error}</div>;

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Gestión de Usuarios</h1>
                <button className={styles.actionButton} onClick={() => openModal()}>
                    <Plus size={18} /> Añadir Usuario
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: user.role === 'administrador' ? '#e6fffa' : '#ebf8ff',
                                        color: user.role === 'administrador' ? '#2c7a7b' : '#2b6cb0',
                                        fontSize: '0.9em'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{user.first_name} {user.last_name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone_number}</td>
                                <td>
                                    <Edit
                                        className={styles.actionIcon}
                                        size={18}
                                        onClick={() => openModal(user)}
                                    />
                                    <Trash2
                                        className={styles.actionIcon}
                                        size={18}
                                        onClick={() => handleDelete(user.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {currentUser.id ? 'Editar Usuario' : 'Añadir Usuario'}
                            </h2>
                            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} style={{ color: '#333' }}>Nombre</label>
                                    <input
                                        className={styles.input}
                                        style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                        value={currentUser.first_name || ''}
                                        onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} style={{ color: '#333' }}>Apellido</label>
                                    <input
                                        className={styles.input}
                                        style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                        value={currentUser.last_name || ''}
                                        onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} style={{ color: '#333' }}>Email</label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                        value={currentUser.email || ''}
                                        onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} style={{ color: '#333' }}>Teléfono</label>
                                    <input
                                        type="tel"
                                        className={styles.input}
                                        style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                        value={currentUser.phone_number || ''}
                                        onChange={(e) => setCurrentUser({ ...currentUser, phone_number: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} style={{ color: '#333' }}>Rol</label>
                                <select
                                    className={styles.input}
                                    style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                    value={currentUser.role || 'empleado'}
                                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                                    required
                                >
                                    <option value="administrador">Administrador</option>
                                    <option value="freelance">Freelance</option>
                                    <option value="empleado">Empleado</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} style={{ color: '#333' }}>Usuario (Username)</label>
                                    <input
                                        className={styles.input}
                                        style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                        value={currentUser.username || ''}
                                        onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} style={{ color: '#333' }}>
                                        {currentUser.id ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                                    </label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        style={{ background: '#f8fafc', border: '1px solid #ddd', color: '#333' }}
                                        value={currentUser.password || ''}
                                        onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                                        required={!currentUser.id}
                                    />
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles.saveButton} disabled={loading}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
