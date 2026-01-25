import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const featured = searchParams.get('featured');
        const promotion = searchParams.get('promotion');

        let sql = 'SELECT t.*, d.name as destination_name FROM tours t LEFT JOIN destinations d ON t.destination_id = d.id WHERE 1=1';
        const values: any[] = [];
        let paramIndex = 1;

        if (featured === 'true') {
            sql += ` AND t.is_featured = $${paramIndex}`;
            values.push(true);
            paramIndex++;
        }

        if (promotion === 'true') {
            sql += ` AND t.is_promotion = $${paramIndex}`;
            values.push(true);
            paramIndex++;
        }

        sql += ' ORDER BY t.name ASC';

        const result = await query(sql, values);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching public tours:', error);
        return NextResponse.json([
            { id: 1, name: 'Jeep Safari Macanao', price: 45, stars: 5, image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop', destination_name: 'Isla de Margarita', is_featured: true },
            { id: 2, name: 'Catamarán a Isla de Coche', price: 60, stars: 5, image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop', destination_name: 'Isla de Margarita', is_promotion: true }
        ]);
    }
}
