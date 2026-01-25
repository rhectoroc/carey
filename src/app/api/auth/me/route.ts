import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Refresh last_active timestamp in DB
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('admin_session');
        if (sessionToken?.value) {
            await query(
                'UPDATE admin_sessions SET last_active = CURRENT_TIMESTAMP WHERE token = $1',
                [sessionToken.value]
            );
        }

        return NextResponse.json({
            id: user.id,
            username: user.username,
            role: user.role
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
