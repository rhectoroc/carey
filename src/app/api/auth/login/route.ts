import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

// verifyPassword helper remains same for now (assumes salt:hash or direct compare if migrating)
function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const [salt, key] = storedHash.split(':');
        if (!salt || !key) {
            if (password === storedHash) resolve(true);
            else resolve(false);
            return;
        }
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(key === derivedKey.toString('hex'));
        });
    });
}

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // Changed table to auth_user
        const result = await query('SELECT * FROM auth_user WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await verifyPassword(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const response = NextResponse.json({ success: true, role: user.role });

        // Store role and userId in session
        const sessionData = JSON.stringify({
            userId: user.id,
            username: user.username,
            role: user.role // 'administrador', 'freelance', or 'empleado'
        });
        const base64Session = Buffer.from(sessionData).toString('base64');

        response.cookies.set('admin_session', base64Session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
