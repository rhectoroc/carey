import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/slugify';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { name, description, image_url, is_featured, is_promotion, type } = body;

        const slug = slugify(name);

        let sql = `
            UPDATE destinations
            SET name = $1, slug = $2, description = $3, image_url = $4, is_featured = $5, is_promotion = $6, type = $7, gallery = $8, tags = $9
            WHERE id = $10
        `;
        const values = [name, slug, description, image_url, is_featured, is_promotion, type || 'Ciudad', body.gallery || [], body.tags || [], id];

        // RBAC: Non-admin can only update their own
        if (user.role !== 'administrador') {
            sql += ' AND created_by = $10';
            values.push(user.id);
        }

        sql += ' RETURNING *';

        const result = await query(sql, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Destination not found or permission denied' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);

    } catch (error: any) {
        console.error('Error updating destination:', error);
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
        let sql = 'DELETE FROM destinations WHERE id = $1';
        const values = [id];

        // RBAC
        if (user.role !== 'administrador') {
            sql += ' AND created_by = $2';
            values.push(user.id);
        }

        sql += ' RETURNING id';

        const result = await query(sql, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Destination not found or permission denied' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting destination:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
