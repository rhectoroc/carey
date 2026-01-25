import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const sql = `
            SELECT id, title, location, description, video_url, thumbnail_url 
            FROM unforgettable_moments 
            WHERE is_active = TRUE
            ORDER BY created_at DESC
        `;
        const result = await query(sql);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json([]);
    }
}
