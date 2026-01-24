import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
    const { filename } = await params;

    // Safety check: prevent directory traversal
    const safeFilename = path.basename(filename);

    // Priority 1: /files (Production Volume)
    let filePath = path.join('/files', safeFilename);

    try {
        await fs.access(filePath);
    } catch {
        // Priority 2: public/uploads (Local/Fallback)
        filePath = path.join(process.cwd(), 'public', 'uploads', safeFilename);
    }

    try {
        const fileBuffer = await fs.readFile(filePath);

        // Determine content type (basic mapping)
        const ext = path.extname(safeFilename).toLowerCase();
        let contentType = 'application/octet-stream';

        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.mp4') contentType = 'video/mp4';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('File serve error:', error);
        return new NextResponse(null, { status: 404 });
    }
}
