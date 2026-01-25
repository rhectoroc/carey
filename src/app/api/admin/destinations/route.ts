import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let sql = 'SELECT * FROM destinations';
        const params: any[] = [];

        // RBAC Logic: 
        // Administrator: Can see ALL
        // Freelance/Employee: Cannot see Administrator's items. 
        // Simplest interpretation: They see only their own items (or items created by other non-admins? usually "own" is safer).
        // User request: "el administrador puede ver todos lo creado por freelance y empleados pero ellos no pueden ver lo de administrador"
        // This usually implies a hierarchy. 
        // Implementation: Non-admin sees ONLY their own created items.
        if (user.role !== 'administrador') {
            sql += ' WHERE created_by = $1';
            params.push(user.id);
        }

        sql += ' ORDER BY name ASC';

        const result = await query(sql, params);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching destinations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, slug, description, image_url, is_featured, is_promotion, type } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and Slug are required' }, { status: 400 });
        }

        const sql = `
            INSERT INTO destinations (name, slug, description, image_url, is_featured, is_promotion, type, gallery, tags, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const values = [name, slug, description, image_url, is_featured || false, is_promotion || false, type || 'Ciudad', body.gallery || [], body.tags || [], user.id];

        const result = await query(sql, values);
        return NextResponse.json(result.rows[0], { status: 201 });

    } catch (error: any) {
        console.error('Error creating destination:', error);
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
