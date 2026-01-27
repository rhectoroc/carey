'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Map, Bed, Compass, LogOut, User, Car, Camera } from 'lucide-react';
import styles from './admin.module.css';

import { NotificationProvider } from '@/components/UI/NotificationProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isLoginPage = pathname === '/admin/login';
    const [user, setUser] = React.useState<{ username: string, role: string } | null>(null);

    React.useEffect(() => {
        if (!isLoginPage) {
            fetch('/api/auth/me')
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Unauthorized');
                })
                .then(data => setUser(data))
                .catch(() => router.push('/admin/login'));
        }
    }, [isLoginPage, router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    if (isLoginPage) {
        return (
            <NotificationProvider>
                {children}
            </NotificationProvider>
        );
    }

    const navItems = [
        { name: 'Inicio', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Hoteles', href: '/admin/hotels', icon: Bed },
        { name: 'Destinos', href: '/admin/destinations', icon: Map },
        { name: 'Tours', href: '/admin/tours', icon: Compass },
        { name: 'Traslados', href: '/admin/transfers', icon: Car },
        { name: 'Momentos', href: '/admin/moments', icon: Camera },
        { name: 'Usuarios', href: '/admin/users', icon: User, adminOnly: true },
    ].filter(item => !item.adminOnly || user?.role === 'administrador');

    return (
        <NotificationProvider>
            <div className={styles.adminParams}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarBrand}>
                        {/* Placeholder for Logo if needed, or just keep nav */}
                    </div>
                    <nav className={styles.nav}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
                                >
                                    <Icon size={20} />
                                    {item.name}
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className={styles.navLink}
                            style={{ marginTop: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', width: '100%' }}
                        >
                            <LogOut size={20} />
                            Cerrar Sesión
                        </button>
                    </nav>
                </aside>
                <div className={styles.mainWrapper}>
                    <header className={styles.topHeader}>
                        <div className={styles.headerLeft}>
                            <span className={styles.headerLogoText}>Admin Carey</span>
                        </div>
                        <div className={styles.headerRight}>
                            <div className={styles.userInfo}>
                                <User size={18} />
                                <span>{user?.username || 'Cargando...'}</span>
                            </div>
                        </div>
                    </header>
                    <main className={styles.mainContent}>
                        {children}
                    </main>
                </div>
            </div>
        </NotificationProvider>
    );
}
