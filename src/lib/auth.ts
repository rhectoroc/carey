import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) return null;

    try {
        const sessionData = JSON.parse(Buffer.from(session.value, 'base64').toString('utf-8'));
        return {
            id: sessionData.userId,
            username: sessionData.username,
            role: sessionData.role
        };
    } catch (e) {
        return null;
    }
}
