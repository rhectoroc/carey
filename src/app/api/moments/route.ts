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
        // Fallback for better UX/Dev
        return NextResponse.json([
            {
                id: 1,
                title: "Life's Beach Tours",
                location: "Jeep Safari",
                description: "Full Day Jeep Safari Tour Naturaleza 4x4",
                video_url: "/videos/lifebeach.mp4",
                thumbnail_url: "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1920&auto=format&fit=crop"
            },
            {
                id: 2,
                title: "Atardecer en Macanao",
                location: "Peninsula de Macanao",
                description: "Siente la inmensidad del desierto y la calidez de un atardecer inolvidable en las dunas de Falcón.",
                video_url: "/videos/macanao.mp4",
                thumbnail_url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1920&auto=format&fit=crop"
            }
        ]);
    }
}
