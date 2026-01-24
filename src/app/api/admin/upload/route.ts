import { NextResponse } from 'next/server';
import { processImage, saveVideo } from '@/lib/imageProcessor';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Authenticate User
        const user = await getCurrentUser();
        // Allow freelance/empleado/admin to upload
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let fileUrl = '';

        if (file.type.startsWith('image/')) {
            fileUrl = await processImage(buffer, file.name);
        } else if (file.type.startsWith('video/')) {
            fileUrl = await saveVideo(buffer, file.name);
        } else {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        return NextResponse.json({ url: fileUrl, success: true });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
