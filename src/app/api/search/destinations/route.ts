import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
        return NextResponse.json([]);
    }

    try {
        const sql = `
            SELECT id, name, type, country 
            FROM destinations 
            WHERE name ILIKE $1 
            LIMIT 10
        `;
        const values = [`%${q}%`];

        const result = await query(sql, values);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Database Error:', error);
        // Fallback for local dev without DB connection
        const mockDestinations = [
            { id: 1, name: 'Isla de Margarita', type: 'island', country: 'Venezuela' },
            { id: 2, name: 'Los Roques', type: 'island', country: 'Venezuela' },
            { id: 3, name: 'Canaima', type: 'park', country: 'Venezuela' },
            { id: 4, name: 'Caracas', type: 'city', country: 'Venezuela' },
            { id: 5, name: 'Mérida', type: 'city', country: 'Venezuela' }
        ].filter(d => d.name.toLowerCase().includes(q.toLowerCase()));

        return NextResponse.json(mockDestinations);
    }
}
