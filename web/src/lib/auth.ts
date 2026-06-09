import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { query } from './db';

const SALT_ROUNDS = 12;
const SESSION_TIMEOUT_MINUTES = 15;

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session');

    if (!sessionToken?.value) return null;

    try {
        // Look up session in DB
        const result = await query(
            `SELECT s.*, u.username, u.role 
             FROM admin_sessions s 
             JOIN auth_user u ON s.user_id = u.id 
             WHERE s.token = $1 AND s.is_active = true`,
            [sessionToken.value]
        );

        const session = result.rows[0];

        if (!session) return null;

        // Check for inactivity timeout (15 minutes)
        const lastActive = new Date(session.last_active);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);

        if (diffMinutes > SESSION_TIMEOUT_MINUTES) {
            // Mark session as inactive in DB
            await query('UPDATE admin_sessions SET is_active = false WHERE token = $1', [sessionToken.value]);
            return null;
        }

        return {
            id: session.user_id,
            username: session.username,
            role: session.role
        };
    } catch (e) {
        console.error('getCurrentUser error:', e);
        return null;
    }
}
