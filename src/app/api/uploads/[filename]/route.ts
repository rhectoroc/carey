import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
    const { filename } = await params;

    // Safety check: prevent directory traversal
    const safeFilename = path.basename(filename);

    // We assume this route is ONLY used when serving from /files
    // If we are in local dev using public/uploads, this route might not be hit if we used the direct URL,
    // OR we can make this route generic to look in both places if we wanted.
    // But per imageProcessor.ts logic:
    // Prod: /files -> returns URL /api/uploads/filename
    // Dev:  public/uploads -> returns URL /uploads/filename (served statically by Next.js)

    // So this route specifically services the /files directory
    const filePath = path.join('/files', safeFilename);

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
