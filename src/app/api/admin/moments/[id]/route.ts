import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { title, location, description, video_url, thumbnail_url, is_active } = body;

        const sql = `
            UPDATE unforgettable_moments
            SET title = $1, location = $2, description = $3, video_url = $4, thumbnail_url = $5, is_active = $6
            WHERE id = $7
            RETURNING *
        `;
        const values = [title, location, description, video_url, thumbnail_url, is_active, id];

        const result = await query(sql, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Moment not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);

    } catch (error: any) {
        console.error('Error updating moment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const sql = 'DELETE FROM unforgettable_moments WHERE id = $1 RETURNING id';
        const values = [id];

        const result = await query(sql, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Moment not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting moment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
