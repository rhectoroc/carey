import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const featured = searchParams.get('featured');
        const promotion = searchParams.get('promotion');

        let sql = 'SELECT h.*, d.name as destination_name FROM hotels h LEFT JOIN destinations d ON h.destination_id = d.id WHERE 1=1';
        const values: any[] = [];
        let paramIndex = 1;

        if (featured === 'true') {
            sql += ` AND h.is_featured = $${paramIndex}`;
            values.push(true);
            paramIndex++;
        }

        if (promotion === 'true') {
            sql += ` AND h.is_promotion = $${paramIndex}`;
            values.push(true);
            paramIndex++;
        }

        sql += ' ORDER BY h.name ASC';

        const result = await query(sql, values);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching public hotels:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
