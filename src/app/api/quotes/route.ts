import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 20;
        const offset = (page - 1) * limit;
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let sql = `
            SELECT 
                q.*, 
                h.name as hotel_name, 
                c.first_name, c.last_name, c.document_id, c.email as customer_email, c.phone_number
            FROM quotes q
            LEFT JOIN hotels h ON q.hotel_id = h.id
            LEFT JOIN customers c ON q.customer_id = c.id
            WHERE 1=1
        `;
        const values: any[] = [];
        let paramIndex = 1;

        if (status && status !== 'todos') {
            sql += ` AND q.status = $${paramIndex}`;
            values.push(status);
            paramIndex++;
        }

        if (search) {
            sql += ` AND (
                c.first_name ILIKE $${paramIndex} OR 
                c.last_name ILIKE $${paramIndex} OR 
                c.document_id ILIKE $${paramIndex} OR
                q.user_name ILIKE $${paramIndex}
            )`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        sql += ` ORDER BY q.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(limit, offset);

        const result = await query(sql, values);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching admin quotes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing ID or Status' }, { status: 400 });
        }

        const result = await query(
            'UPDATE quotes SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating quote status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            user_name,
            user_email,
            user_phone,
            hotel_id,
            check_in,
            check_out,
            adults,
            children_4_10,
            children_0_3,
            extra_services = [] // Array of { type: 'tour' | 'transfer', id: number }
        } = body;

        // 1. Validate Basic Inputs
        // Require User Info
        if (!user_name || !user_email) {
            return NextResponse.json({ error: 'Missing contact info' }, { status: 400 });
        }

        // Require at least ONE service (Hotel OR Extras)
        if (!hotel_id && (!extra_services || extra_services.length === 0)) {
            return NextResponse.json({ error: 'Must select at least a Hotel or one Extra Service' }, { status: 400 });
        }

        let totalAccommodation = 0;

        // 2. Calculate Accommodation (Only if Hotel is selected)
        if (hotel_id) {
            if (!check_in || !check_out) {
                return NextResponse.json({ error: 'Dates required for Hotel' }, { status: 400 });
            }

            const checkInDate = new Date(check_in);
            const checkOutDate = new Date(check_out);
            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

            if (nights < 1) {
                return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 });
            }

            // Fetch Hotel Prices
            const hotelRes = await query('SELECT price, price_child, price_infant FROM hotels WHERE id = $1', [hotel_id]);
            if (hotelRes.rows.length === 0) {
                return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
            }
            const hotel = hotelRes.rows[0];

            // Base Cost Per Night = (Adults * Price) + (Kids * ChildPrice) + (Infants * InfantPrice)
            const adultCost = (adults || 0) * Number(hotel.price || 0);
            const childCost = (children_4_10 || 0) * Number(hotel.price_child || 0);
            const infantCost = (children_0_3 || 0) * Number(hotel.price_infant || 0);

            const costPerNight = adultCost + childCost + infantCost;
            totalAccommodation = costPerNight * nights;
        }

        // 3. Calculate Extra Services Cost
        let totalExtras = 0;

        // This could be optimized, but keeping simple loop
        for (const service of extra_services) {
            if (!service.id) continue;

            let price = 0;
            if (service.type === 'tour') {
                const res = await query('SELECT price FROM tours WHERE id = $1', [service.id]);
                if (res.rows.length > 0) price = Number(res.rows[0].price || 0);
            } else if (service.type === 'transfer') {
                const res = await query('SELECT price FROM transfers WHERE id = $1', [service.id]);
                if (res.rows.length > 0) price = Number(res.rows[0].price || 0);
            }

            const payingPassengers = (adults || 0) + (children_4_10 || 0);
            totalExtras += price * payingPassengers;
        }

        const finalTotal = totalAccommodation + totalExtras;

        // 4. Save Quote
        const insertSql = `
            INSERT INTO quotes (
                user_name, user_email, user_phone, hotel_id, 
                check_in, check_out, adults, children_4_10, children_0_3, 
                extra_services, total_price, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pendiente')
            RETURNING *
        `;

        const result = await query(insertSql, [
            user_name, user_email, user_phone, hotel_id || null,
            check_in || null, check_out || null,
            adults || 1, children_4_10 || 0, children_0_3 || 0,
            JSON.stringify(extra_services), finalTotal
        ]);

        return NextResponse.json(result.rows[0], { status: 201 });

    } catch (error) {
        console.error('Error creating quote:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
