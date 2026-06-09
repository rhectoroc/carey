const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function optimize() {
    const publicDir = path.join(__dirname, '..', 'public');
    const imagesDir = path.join(publicDir, 'images');

    const tasks = [
        {
            input: path.join(publicDir, 'LogoCarey01.png'),
            output: path.join(publicDir, 'LogoCarey01-opt.png'),
            width: 300 // Logo doesn't need to be huge
        },
        {
            input: path.join(imagesDir, 'carey-avatar.png'),
            output: path.join(imagesDir, 'carey-avatar-opt.png'),
            width: 120 // Avatar is very small in UI
        }
    ];

    for (const task of tasks) {
        if (fs.existsSync(task.input)) {
            console.log(`Optimizing: ${task.input}`);
            await sharp(task.input)
                .resize(task.width)
                .png({ quality: 80, compressionLevel: 9 })
                .toFile(task.output);

            const oldSize = fs.statSync(task.input).size;
            const newSize = fs.statSync(task.output).size;
            console.log(`Done! ${Math.round(oldSize / 1024)}KB -> ${Math.round(newSize / 1024)}KB`);

            // Overwrite original
            fs.unlinkSync(task.input);
            fs.renameSync(task.output, task.input);
        } else {
            console.log(`Skipping (not found): ${task.input}`);
        }
    }
}

optimize().catch(console.error);
