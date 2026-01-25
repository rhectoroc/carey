import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { name, slug, description, price, duration, destination_id, image_url, included, is_featured, is_promotion, price_valid_until, price_child, price_infant, tags, gallery, type, stars } = body;

        let sql = `
            UPDATE tours
            SET name = $1, slug = $2, description = $3, price = $4, duration = $5, destination_id = $6, image_url = $7, included = $8, is_featured = $9, is_promotion = $10, price_valid_until = $11, price_child = $12, price_infant = $13, tags = $14, gallery = $15, type = $16, stars = $17
            WHERE id = $18
        `;
        const values = [name, slug, description, price, duration, destination_id, image_url, JSON.stringify(included || []), is_featured, is_promotion, price_valid_until, price_child, price_infant, JSON.stringify(tags || []), JSON.stringify(gallery || []), type || 'Aventura', stars || 5, id];

        if (user.role !== 'administrador') {
            sql += ' AND created_by = $17';
            values.push(user.id);
        }

        sql += ' RETURNING *';

        const result = await query(sql, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Tour not found or permission denied' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);

    } catch (error: any) {
        console.error('Error updating tour:', error);
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
        let sql = 'DELETE FROM tours WHERE id = $1';
        const values = [id];

        if (user.role !== 'administrador') {
            sql += ' AND created_by = $2';
            values.push(user.id);
        }

        sql += ' RETURNING id';

        const result = await query(sql, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Tour not found or permission denied' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting tour:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
