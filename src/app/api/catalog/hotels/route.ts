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
        return NextResponse.json([
            { id: 1, name: 'Hesperia Isla Margarita', price: 85, stars: 5, image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop', destination_name: 'Isla de Margarita', is_featured: true },
            { id: 2, name: 'Ikin Margarita Hotel', price: 120, stars: 5, image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop', destination_name: 'Isla de Margarita', is_promotion: true }
        ]);
    }
}
