import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let sql = `
            SELECT t.*, d.name as destination_name 
            FROM tours t
            LEFT JOIN destinations d ON t.destination_id = d.id
        `;
        const params: any[] = [];

        if (user.role !== 'administrador') {
            sql += ' WHERE t.created_by = $1';
            params.push(user.id);
        }

        sql += ' ORDER BY t.name ASC';

        const result = await query(sql, params);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching tours:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, slug, description, price, duration, destination_id, image_url, included, is_featured, is_promotion } = body;

        const sql = `
            INSERT INTO tours (name, slug, description, price, duration, destination_id, image_url, included, is_featured, is_promotion, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        const values = [name, slug, description, price, duration, destination_id, image_url, included || [], is_featured || false, is_promotion || false, user.id];

        const result = await query(sql, values);
        return NextResponse.json(result.rows[0], { status: 201 });

    } catch (error: any) {
        console.error('Error creating tour:', error);
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
