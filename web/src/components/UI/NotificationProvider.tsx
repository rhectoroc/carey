'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
}

interface NotificationContextType {
    showNotification: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((type: NotificationType, message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, type, message }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                pointerEvents: 'none'
            }}>
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        style={{
                            pointerEvents: 'auto',
                            minWidth: '300px',
                            background: 'white',
                            color: '#333',
                            padding: '16px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            borderLeft: `6px solid ${n.type === 'success' ? '#10b981' : n.type === 'error' ? '#ef4444' : '#3b82f6'
                                }`,
                            animation: 'slideIn 0.3s ease-out'
                        }}
                    >
                        <div style={{ color: n.type === 'success' ? '#10b981' : n.type === 'error' ? '#ef4444' : '#3b82f6' }}>
                            {n.type === 'success' ? <CheckCircle size={20} /> : n.type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>
                            {n.message}
                        </div>
                        <button
                            onClick={() => removeNotification(n.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <style jsx global>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
