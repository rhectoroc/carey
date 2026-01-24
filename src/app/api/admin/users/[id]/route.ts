import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'administrador') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { username, role, first_name, last_name, email, phone_number, password } = body;

        let sql = `
            UPDATE auth_user
            SET username = $1, role = $2, first_name = $3, last_name = $4, email = $5, phone_number = $6
        `;
        const values = [username, role, first_name, last_name, email, phone_number];

        let paramIndex = 7;

        if (password && password.trim() !== '') {
            const hashedPassword = await hashPassword(password);
            sql += `, password_hash = $${paramIndex} `;
            values.push(hashedPassword);
            paramIndex++;
        }

        sql += ` WHERE id = $${paramIndex} RETURNING id, username, role, first_name, last_name, email, phone_number`;
        values.push(id);

        const result = await query(sql, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);

    } catch (error: any) {
        console.error('Error updating user:', error);
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Username or Email already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'administrador') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        if (Number(id) === currentUser.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        const result = await query('DELETE FROM auth_user WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
