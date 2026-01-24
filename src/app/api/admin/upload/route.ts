import { NextResponse } from 'next/server';
import { processImage, saveVideo } from '@/lib/imageProcessor';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name;
        const mimeType = file.type;

        let url = '';

        if (mimeType.startsWith('image/')) {
            url = await processImage(buffer, filename);
        } else if (mimeType.startsWith('video/')) {
            url = await saveVideo(buffer, filename);
        } else {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        return NextResponse.json({ url });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
