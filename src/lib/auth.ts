import { cookies } from 'next/headers';

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) return null;

    try {
        const sessionData = JSON.parse(Buffer.from(session.value, 'base64').toString('utf-8'));
        return {
            id: sessionData.userId,
            username: sessionData.username,
            role: sessionData.role // 'administrador', 'freelance', 'empleado'
        };
    } catch (e) {
        return null;
    }
}
