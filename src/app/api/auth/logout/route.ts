import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function POST() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session');

    if (sessionToken?.value) {
        // Invalidate session in DB
        await query('UPDATE admin_sessions SET is_active = false WHERE token = $1', [sessionToken.value]);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');

    return response;
}
