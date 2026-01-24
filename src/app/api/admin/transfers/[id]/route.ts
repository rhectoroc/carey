import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { name, slug, type, description, price, capacity, destination_id, image_url, is_featured, is_promotion } = body;

        let sql = `
            UPDATE transfers
            SET name = $1, slug = $2, type = $3, description = $4, price = $5, capacity = $6, destination_id = $7, image_url = $8, is_featured = $9, is_promotion = $10
            WHERE id = $11
        `;
        const values = [name, slug, type, description, price, capacity, destination_id, image_url, is_featured, is_promotion, id];

        if (user.role !== 'administrador') {
            sql += ' AND created_by = $12';
            values.push(user.id);
        }

        sql += ' RETURNING *';

        const result = await query(sql, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Transfer not found or permission denied' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);

    } catch (error: any) {
        console.error('Error updating transfer:', error);
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
        let sql = 'DELETE FROM transfers WHERE id = $1';
        const values = [id];

        if (user.role !== 'administrador') {
            sql += ' AND created_by = $2';
            values.push(user.id);
        }

        sql += ' RETURNING id';

        const result = await query(sql, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Transfer not found or permission denied' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error deleting transfer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
