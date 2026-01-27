import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { name, slug, description, price, destination_id, image_url, stars, features, is_featured, is_promotion, type, price_child, price_infant, room_types, occupancies, plan_types } = body;

        let sql = `
            UPDATE hotels
            SET name = $1, slug = $2, description = $3, price = $4, destination_id = $5, image_url = $6, stars = $7, features = $8, is_featured = $9, is_promotion = $10, type = $11, price_child = $12, price_infant = $13, gallery = $14, tags = $15, room_types = $16, occupancies = $17, plan_types = $18
            WHERE id = $19
        `;
        const values = [
            name,
            slug,
            description,
            price,
            destination_id,
            image_url,
            stars,
            features,
            is_featured,
            is_promotion,
            type || 'Hotel',
            price_child,
            price_infant,
            body.gallery || [],
            body.tags || [],
            JSON.stringify(room_types || []),
            JSON.stringify(occupancies || []),
            JSON.stringify(plan_types || []),
            id
        ];

        if (user.role !== 'administrador') {
            sql = sql.replace('WHERE id = $19', 'WHERE id = $19 AND created_by = $20');
            values.push(user.id);
        }

        sql += ' RETURNING *';

        const result = await query(sql, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Hotel not found or permission denied' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);

    } catch (error: any) {
        console.error('Error updating hotel:', error);
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        let sql = 'DELETE FROM hotels WHERE id = $1';
        const values = [id];

        if (user.role !== 'administrador') {
            sql += ' AND created_by = $2';
            values.push(user.id);
        }

        sql += ' RETURNING id';

        const result = await query(sql, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Hotel not found or permission denied' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting hotel:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
