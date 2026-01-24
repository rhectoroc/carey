import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const sql = `
            SELECT t.*, d.name as destination_name 
            FROM transfers t
            LEFT JOIN destinations d ON t.destination_id = d.id
            ORDER BY t.name ASC
        `;
        const result = await query(sql);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching public transfers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
