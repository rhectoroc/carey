import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const sql = `
            SELECT m.*, u.username as creator_name 
            FROM unforgettable_moments m
            LEFT JOIN auth_user u ON m.created_by = u.id
            ORDER BY m.created_at DESC
        `;
        const result = await query(sql);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching moments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { title, location, description, video_url, thumbnail_url, is_active } = body;

        const sql = `
            INSERT INTO unforgettable_moments (title, location, description, video_url, thumbnail_url, is_active, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [title, location, description, video_url, thumbnail_url, is_active !== false, user.id];

        const result = await query(sql, values);
        return NextResponse.json(result.rows[0], { status: 201 });

    } catch (error: any) {
        console.error('Error creating moment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
