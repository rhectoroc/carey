import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const destinationId = searchParams.get('destination_id');

        let sql = `
            SELECT t.*, d.name as destination_name 
            FROM transfers t
            LEFT JOIN destinations d ON t.destination_id = d.id
            WHERE 1=1
        `;
        const values: any[] = [];
        let paramIndex = 1;

        if (destinationId) {
            sql += ` AND t.destination_id = $${paramIndex}`;
            values.push(destinationId);
        }

        sql += ' ORDER BY t.name ASC';

        const result = await query(sql, values);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching public transfers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
