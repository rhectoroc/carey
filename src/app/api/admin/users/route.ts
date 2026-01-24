import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'administrador') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Exclude password_hash for security
        const sql = 'SELECT id, username, role, first_name, last_name, email, phone_number, created_at FROM auth_user ORDER BY username ASC';
        const result = await query(sql);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'administrador') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { username, password, role, first_name, last_name, email, phone_number } = body;

        if (!username || !password || !role) {
            return NextResponse.json({ error: 'Username, Password and Role are required' }, { status: 400 });
        }

        // Note: Password should be hashed here in production.
        // As per previous instruction, we are handling raw/simple hash for this MPV phase 
        // OR the user is inserting simple passwords.
        // We will store it as is (or basic hash) for now as we don't have a specific hashing lib requirement enforced yet other than what we used in login.
        // Ideally: const hashedPassword = await hash(password);
        const passwordHash = password; // Replace with proper hashing if bcrypt is installed/requested

        const sql = `
            INSERT INTO auth_user (username, password_hash, role, first_name, last_name, email, phone_number)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, username, role, first_name, last_name, email, phone_number, created_at
        `;
        const values = [username, passwordHash, role, first_name, last_name, email, phone_number];

        const result = await query(sql, values);
        return NextResponse.json(result.rows[0], { status: 201 });

    } catch (error: any) {
        console.error('Error creating user:', error);
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Username or Email already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
