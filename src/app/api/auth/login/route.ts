import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const result = await query('SELECT * FROM auth_user WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await comparePassword(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate a secure session token
        const token = crypto.randomBytes(32).toString('hex');

        // Prevent concurrent logins: Deactivate previous sessions for this user
        await query('UPDATE admin_sessions SET is_active = false WHERE user_id = $1', [user.id]);

        // Insert new session
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        await query(
            'INSERT INTO admin_sessions (user_id, token, user_agent, ip_address) VALUES ($1, $2, $3, $4)',
            [user.id, token, userAgent, ip]
        );

        const response = NextResponse.json({ success: true, role: user.role });

        // Detect HTTPS via X-Forwarded-Proto (set by Easypanel's reverse proxy).
        // Do NOT rely on NODE_ENV alone — the app runs on HTTP internally even in production.
        const proto = request.headers.get('x-forwarded-proto');
        const isHttps = proto === 'https';

        // Set the session token in cookies
        response.cookies.set('admin_session', token, {
            httpOnly: true,
            secure: isHttps,
            sameSite: 'lax',       // 'strict' can block the cookie on first load after redirect
            maxAge: 60 * 60 * 24,  // 1 día (inactividad de 15 min controlada server-side)
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
