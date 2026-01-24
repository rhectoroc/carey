import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const result = await query('SELECT * FROM auth_user WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            // Using generic error message for security (don't reveal if user exists)
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await comparePassword(password, user.password_hash);

        // Fallback for legacy plain text passwords (optional: remove this block for strict only mode)
        // Checks if password matches hash directly (only if hash doesn't look like bcrypt)
        // This allows the user to login once with the plain text, we could upgrade it here but simpler to just allow.
        // Actually, for "Secure Protocols" request, we should probably prefer NOT to support plain text, 
        // BUT the user just inserted one. 
        // Let's keep the fallback but make it temporary/Migration logic? 
        // Better: We will give the user the HASHED string for their SQL insert in the response, so they fix it at source.
        // So here, I will stick to Strict comparison. If it fails, they need to update DB.

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const response = NextResponse.json({ success: true, role: user.role });

        const sessionData = JSON.stringify({
            userId: user.id,
            username: user.username,
            role: user.role
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
