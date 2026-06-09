import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// Determine storage directory
async function getStorageConfig() {
    // Check if /files exists (Production / EasyPanel Volume)
    try {
        await fs.access('/files');
        return {
            dir: '/files',
            urlPrefix: '/api/uploads' // Files in /files served via API route
        };
    } catch {
        // Fallback to public/uploads (Local Development)
        const localDir = path.join(process.cwd(), 'public', 'uploads');
        try {
            await fs.access(localDir);
        } catch {
            await fs.mkdir(localDir, { recursive: true });
        }
        return {
            dir: localDir,
            urlPrefix: '/api/uploads' // Use API route even locally for consistency & standalone support
        };
    }
}

export async function processImage(buffer: Buffer, filename: string): Promise<string> {
    const config = await getStorageConfig();

    // Create a unique filename with .webp extension for optimization
    const timestamp = Date.now();
    const cleanName = path.parse(filename).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const newFilename = `${cleanName}-${timestamp}.webp`;
    const outputPath = path.join(config.dir, newFilename);

    // Process image: Resize, Convert to WebP, Optimize
    await sharp(buffer)
        .resize(1200, 800, { // Standard logical size for cards/web
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ quality: 80 }) // Good balance of size/quality
        .toFile(outputPath);

    // Return the URL
    return `${config.urlPrefix}/${newFilename}`;
}

export async function saveVideo(buffer: Buffer, filename: string): Promise<string> {
    const config = await getStorageConfig();

    const timestamp = Date.now();
    const cleanName = path.parse(filename).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const ext = path.parse(filename).ext;
    const newFilename = `${cleanName}-${timestamp}${ext}`;
    const outputPath = path.join(config.dir, newFilename);

    await fs.writeFile(outputPath, buffer);

    return `${config.urlPrefix}/${newFilename}`;
}

