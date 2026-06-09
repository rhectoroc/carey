import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Maintenance Mode Logic
    // Set to true manually to force maintenance mode without depending on .env
    const MAINTENANCE_MODE = true;
    const isMaintenancePath = request.nextUrl.pathname === '/maintenance';
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin');

    if (MAINTENANCE_MODE && !isAdminPath && !isMaintenancePath) {
        return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    // Admin Auth Logic
    if (isAdminPath) {
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
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - any file with an extension like .png, .jpg, .svg, etc.
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
