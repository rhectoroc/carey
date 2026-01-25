import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Next.js middleware doesn't easily support 'pg' pool directly due to edge runtime limitations.
// However, if using Easypanel, it's likely a standard Node environment.
// But Next.js Middleware runs in Edge/subset of Node. 
// A better approach for Middleware session tracking is calling an internal API or 
// just relying on the database check in 'getCurrentUser' which handles the timeout.
// To keep it simple and compatible with Next.js middleware constraints, 
// I will move the 'last_active' update logic to an API call or rely on it being updated 
// when the admin pages fetch their initial data.
// Actually, standard Next.js (non-edge) middleware CAN use DB if configured, 
// but it's risky. Let's use a fetch to an internal 'touch' endpoint or 
// just handle it in the layout/data fetching.
// Given the current structure, I will update the middleware to just check the cookie 
// and the 'last_active' will be updated by the 'me' endpoint which is called on every admin page load.

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        const session = request.cookies.get('admin_session');

        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
