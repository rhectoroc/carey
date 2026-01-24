import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const featured = searchParams.get('featured');
        const promotion = searchParams.get('promotion');

        let sql = 'SELECT * FROM destinations WHERE 1=1';
        const values: any[] = [];
        let paramIndex = 1;

        if (featured === 'true') {
            sql += ` AND is_featured = $${paramIndex}`;
            values.push(true);
            paramIndex++;
        }

        if (promotion === 'true') {
            sql += ` AND is_promotion = $${paramIndex}`;
            values.push(true);
            paramIndex++;
        }

        sql += ' ORDER BY name ASC';

        const result = await query(sql, values);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching public destinations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
