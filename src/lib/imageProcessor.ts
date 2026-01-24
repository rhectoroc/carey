import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export async function processImage(buffer: Buffer, filename: string): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure upload directory exists
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
    }

    // Create a unique filename with .webp extension for optimization
    const timestamp = Date.now();
    const cleanName = path.parse(filename).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const newFilename = `${cleanName}-${timestamp}.webp`;
    const outputPath = path.join(uploadDir, newFilename);

    // Process image: Resize, Convert to WebP, Optimize
    await sharp(buffer)
        .resize(1200, 800, { // Standard logical size for cards/web
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ quality: 80 }) // Good balance of size/quality
        .toFile(outputPath);

    return `/uploads/${newFilename}`;
}

export async function saveVideo(buffer: Buffer, filename: string): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure upload directory exists
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const cleanName = path.parse(filename).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const ext = path.parse(filename).ext;
    const newFilename = `${cleanName}-${timestamp}${ext}`;
    const outputPath = path.join(uploadDir, newFilename);

    await fs.writeFile(outputPath, buffer);

    return `/uploads/${newFilename}`;
}
